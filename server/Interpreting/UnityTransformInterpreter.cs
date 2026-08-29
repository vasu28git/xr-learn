using System.Globalization;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using XrCodingLab.Server.Models;

namespace XrCodingLab.Server.Interpreting;

public sealed class UnityTransformInterpreter
{
    private const string Stubs = @"
using System;

namespace UnityEngine
{
    public class MonoBehaviour
    {
        public Transform transform { get; } = new Transform();
    }

    public struct Vector3
    {
        public double x;
        public double y;
        public double z;
        public Vector3(double x, double y, double z) { this.x = x; this.y = y; this.z = z; }
    }

    public struct Quaternion
    {
        public static Quaternion Euler(double x, double y, double z) => default;
    }

    public class Transform
    {
        public Vector3 position { get; set; }
        public Vector3 localScale { get; set; }
        public Quaternion rotation { get; set; }
        public void Rotate(double x, double y, double z) {}
    }
}

public static class xr
{
    public static void CreateCube(string name, UnityEngine.Vector3 position, UnityEngine.Vector3 scale) {}
    public static void CreateSphere(string name, UnityEngine.Vector3 position, UnityEngine.Vector3 scale) {}
    public static void CreateCylinder(string name, UnityEngine.Vector3 position, UnityEngine.Vector3 scale) {}
    public static void Rotate(string name, double x, double y, double z) {}
    public static void SetPosition(string name, UnityEngine.Vector3 position) {}
    public static void SetScale(string name, UnityEngine.Vector3 scale) {}
}
";

    public ExecuteResponse Interpret(string source)
    {
        // 1. Enforce source-code length limit
        if (source.Length > 10000)
        {
            return new ExecuteResponse([], [new CodeIssue("runtime", "Source code exceeds maximum length of 10000 characters.", 1, 1)], [], 0);
        }

        // 2. Parse the student's text into SyntaxTree
        var studentTree = CSharpSyntaxTree.ParseText(source, new CSharpParseOptions(LanguageVersion.CSharp12));
        var stubTree = CSharpSyntaxTree.ParseText(Stubs, new CSharpParseOptions(LanguageVersion.CSharp12));

        var root = studentTree.GetCompilationUnitRoot();

        // 3. Get Syntax/Parse errors
        var syntaxErrors = studentTree.GetDiagnostics()
            .Where(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error)
            .Select(ToIssue)
            .ToList();

        if (syntaxErrors.Count > 0)
        {
            return new ExecuteResponse([], syntaxErrors, [], root.DescendantNodes().Count());
        }

        // 4. Create Compilation for semantic analysis
        var assemblyPath = typeof(object).Assembly.Location;
        var coreDir = Path.GetDirectoryName(assemblyPath);
        var references = new List<MetadataReference>
        {
            MetadataReference.CreateFromFile(assemblyPath),
            MetadataReference.CreateFromFile(Path.Combine(coreDir!, "System.Runtime.dll")),
            MetadataReference.CreateFromFile(Path.Combine(coreDir!, "System.Collections.dll")),
            MetadataReference.CreateFromFile(Path.Combine(coreDir!, "System.Linq.dll"))
        };

        var compilation = CSharpCompilation.Create("XrLabCompilation")
            .WithOptions(new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary))
            .AddReferences(references)
            .AddSyntaxTrees(studentTree, stubTree);

        var semanticModel = compilation.GetSemanticModel(studentTree);

        // 5. Get Compilation/Semantic errors
        var compilationDiagnostics = compilation.GetDiagnostics();
        var semanticErrors = compilationDiagnostics
            .Where(d => d.Severity == DiagnosticSeverity.Error && d.Location.SourceTree == studentTree)
            .Select(ToIssue)
            .ToList();

        if (semanticErrors.Count > 0)
        {
            return new ExecuteResponse([], semanticErrors, [], root.DescendantNodes().Count());
        }

        // 6. AST Whitelist Validation Layer
        var validator = new AstValidator(semanticModel);
        validator.Visit(root);

        if (validator.Errors.Count > 0)
        {
            return new ExecuteResponse([], validator.Errors, [], root.DescendantNodes().Count());
        }

        // 7. Interpret
        var methodDeclarations = root.DescendantNodes()
            .OfType<MethodDeclarationSyntax>()
            .Where(m => m.Identifier.ValueText == "Start" || m.Identifier.ValueText == "Update")
            .ToList();

        var interpreterState = new InterpreterState(semanticModel);

        foreach (var method in methodDeclarations)
        {
            if (method.Body != null)
            {
                foreach (var statement in method.Body.Statements)
                {
                    try
                    {
                        interpreterState.InterpretStatement(statement);
                    }
                    catch (Exception ex)
                    {
                        var pos = statement.GetLocation().GetLineSpan().StartLinePosition;
                        interpreterState.Errors.Add(new CodeIssue("runtime", ex.Message, pos.Line + 1, pos.Character + 1));
                        break;
                    }

                    if (interpreterState.Errors.Count > 0)
                    {
                        break;
                    }
                }
            }

            if (interpreterState.Errors.Count > 0)
            {
                break;
            }
        }

        return new ExecuteResponse(
            interpreterState.Commands,
            interpreterState.Errors,
            interpreterState.AstNodes,
            root.DescendantNodes().Count()
        );
    }

    private static CodeIssue ToIssue(Diagnostic diagnostic)
    {
        var position = diagnostic.Location.GetLineSpan().StartLinePosition;
        return new CodeIssue("syntax", diagnostic.GetMessage(), position.Line + 1, position.Character + 1);
    }

    private sealed class AstValidator : CSharpSyntaxWalker
    {
        public List<CodeIssue> Errors { get; } = [];
        private readonly SemanticModel _semanticModel;

        public AstValidator(SemanticModel semanticModel)
        {
            _semanticModel = semanticModel;
        }

        public override void Visit(SyntaxNode? node)
        {
            if (node != null)
            {
                if (!IsNodeKindAllowed(node.Kind()))
                {
                    AddIssue("unsupported", node, $"Unsupported language construct: '{node.Kind()}' is not permitted in this XR module.");
                    return;
                }
            }
            base.Visit(node);
        }

        private static bool IsNodeKindAllowed(SyntaxKind kind)
        {
            return kind switch
            {
                SyntaxKind.CompilationUnit or
                SyntaxKind.UsingDirective or
                SyntaxKind.NamespaceDeclaration or
                SyntaxKind.FileScopedNamespaceDeclaration or
                SyntaxKind.ClassDeclaration or
                SyntaxKind.BaseList or
                SyntaxKind.SimpleBaseType or
                SyntaxKind.MethodDeclaration or
                SyntaxKind.Block or
                SyntaxKind.ExpressionStatement or
                SyntaxKind.LocalDeclarationStatement or
                SyntaxKind.VariableDeclaration or
                SyntaxKind.VariableDeclarator or
                SyntaxKind.EqualsValueClause or
                SyntaxKind.SimpleAssignmentExpression or
                SyntaxKind.IdentifierName or
                SyntaxKind.QualifiedName or
                SyntaxKind.SimpleMemberAccessExpression or
                SyntaxKind.InvocationExpression or
                SyntaxKind.ArgumentList or
                SyntaxKind.Argument or
                SyntaxKind.NumericLiteralExpression or
                SyntaxKind.StringLiteralExpression or
                SyntaxKind.TrueLiteralExpression or
                SyntaxKind.FalseLiteralExpression or
                SyntaxKind.NullLiteralExpression or
                SyntaxKind.CharacterLiteralExpression or
                SyntaxKind.ObjectCreationExpression or
                SyntaxKind.PredefinedType or
                SyntaxKind.AddExpression or
                SyntaxKind.SubtractExpression or
                SyntaxKind.MultiplyExpression or
                SyntaxKind.DivideExpression or
                SyntaxKind.UnaryMinusExpression or
                SyntaxKind.UnaryPlusExpression or
                SyntaxKind.ParenthesizedExpression or
                SyntaxKind.IfStatement or
                SyntaxKind.ElseClause or
                SyntaxKind.ParameterList or
                SyntaxKind.Parameter or
                SyntaxKind.TypeArgumentList or
                SyntaxKind.GenericName => true,
                _ => false
            };
        }

        public override void VisitClassDeclaration(ClassDeclarationSyntax node)
        {
            if (node.BaseList == null || !node.BaseList.Types.Any(t => t.Type.ToString() == "MonoBehaviour"))
            {
                AddIssue("unsupported", node, "Class must inherit from MonoBehaviour.");
            }
            base.VisitClassDeclaration(node);
        }

        public override void VisitMethodDeclaration(MethodDeclarationSyntax node)
        {
            var methodName = node.Identifier.ValueText;
            if (methodName != "Start" && methodName != "Update")
            {
                AddIssue("unsupported", node, $"Method '{methodName}' is not supported. Only 'Start()' and 'Update()' lifecycle methods are allowed.");
                return;
            }
            base.VisitMethodDeclaration(node);
        }

        public override void VisitObjectCreationExpression(ObjectCreationExpressionSyntax node)
        {
            var typeSymbol = _semanticModel.GetTypeInfo(node).Type;
            if (typeSymbol == null || typeSymbol.ToString() != "UnityEngine.Vector3")
            {
                AddIssue("unsupported", node, $"Object creation of type '{node.Type}' is not supported. Only 'Vector3' is allowed.");
                return;
            }
            base.VisitObjectCreationExpression(node);
        }

        public override void VisitInvocationExpression(InvocationExpressionSyntax node)
        {
            var symbol = _semanticModel.GetSymbolInfo(node).Symbol as IMethodSymbol;
            if (symbol == null)
            {
                AddIssue("unsupported", node, $"Unsupported or unresolved operation: '{node.Expression}'.");
                return;
            }

            var containingType = symbol.ContainingType?.ToString();
            var methodName = symbol.Name;

            if (containingType == "xr")
            {
                var allowedMethods = new[] { "CreateCube", "CreateSphere", "CreateCylinder", "Rotate", "SetPosition", "SetScale" };
                if (!allowedMethods.Contains(methodName))
                {
                    AddIssue("unsupported", node, $"Unsupported XR operation: 'xr.{methodName}'.");
                }
            }
            else if (containingType == "UnityEngine.Transform")
            {
                if (methodName != "Rotate")
                {
                    AddIssue("unsupported", node, $"Unsupported operation: 'transform.{methodName}'.");
                }
            }
            else if (containingType == "UnityEngine.Quaternion")
            {
                if (methodName != "Euler")
                {
                    AddIssue("unsupported", node, $"Unsupported operation: 'Quaternion.{methodName}'.");
                }
            }
            else
            {
                AddIssue("unsupported", node, $"Unsupported XR operation: {containingType}.{methodName}");
            }

            base.VisitInvocationExpression(node);
        }

        public override void VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
        {
            var symbol = _semanticModel.GetSymbolInfo(node).Symbol;
            if (symbol != null)
            {
                var containingType = symbol.ContainingType?.ToString();
                if (containingType != null &&
                    containingType != "UnityEngine.Transform" &&
                    containingType != "UnityEngine.Vector3" &&
                    containingType != "UnityEngine.Quaternion" &&
                    containingType != "xr" &&
                    !containingType.StartsWith("UnityEngine.MonoBehaviour"))
                {
                    AddIssue("unsupported", node, $"Access to members of type '{containingType}' is not supported.");
                }
            }
            base.VisitMemberAccessExpression(node);
        }

        private void AddIssue(string kind, SyntaxNode node, string message)
        {
            var position = node.GetLocation().GetLineSpan().StartLinePosition;
            Errors.Add(new CodeIssue(kind, message, position.Line + 1, position.Character + 1));
        }
    }

    private sealed class InterpreterState
    {
        public List<XrCommand> Commands { get; } = [];
        public List<CodeIssue> Errors { get; } = [];
        public List<string> AstNodes { get; } = [];
        public HashSet<string> CreatedObjects { get; } = [];
        private readonly Dictionary<string, object> _variables = [];
        private readonly SemanticModel _semanticModel;

        public InterpreterState(SemanticModel semanticModel)
        {
            _semanticModel = semanticModel;
        }

        public void InterpretStatement(StatementSyntax statement)
        {
            if (statement is LocalDeclarationStatementSyntax localDecl)
            {
                foreach (var variable in localDecl.Declaration.Variables)
                {
                    var name = variable.Identifier.ValueText;
                    if (variable.Initializer != null)
                    {
                        var value = EvaluateExpression(variable.Initializer.Value);
                        if (value != null)
                        {
                            _variables[name] = value;
                        }
                    }
                }
            }
            else if (statement is ExpressionStatementSyntax exprStatement)
            {
                var expr = exprStatement.Expression;
                if (expr is AssignmentExpressionSyntax assignment)
                {
                    InterpretAssignment(assignment);
                }
                else if (expr is InvocationExpressionSyntax invocation)
                {
                    InterpretInvocation(invocation);
                }
            }
            else if (statement is IfStatementSyntax ifStmt)
            {
                InterpretIf(ifStmt);
            }
        }

        private void InterpretIf(IfStatementSyntax ifStmt)
        {
            var conditionVal = EvaluateExpression(ifStmt.Condition);
            bool isTrue = false;
            if (conditionVal is bool b)
            {
                isTrue = b;
            }
            else if (conditionVal is double d)
            {
                isTrue = d != 0;
            }

            if (isTrue)
            {
                InterpretStatement(ifStmt.Statement);
            }
            else if (ifStmt.Else != null)
            {
                InterpretStatement(ifStmt.Else.Statement);
            }
        }

        private void InterpretAssignment(AssignmentExpressionSyntax assignment)
        {
            AstNodes.Add(nameof(AssignmentExpressionSyntax));
            var rightVal = EvaluateExpression(assignment.Right);
            if (rightVal == null)
            {
                throw new Exception("Assignment right-hand side evaluated to null.");
            }

            if (assignment.Left is IdentifierNameSyntax identifier)
            {
                var name = identifier.Identifier.ValueText;
                _variables[name] = rightVal;
                return;
            }

            if (assignment.Left is MemberAccessExpressionSyntax memberAccess)
            {
                var baseStr = memberAccess.Expression.ToString();
                var prop = memberAccess.Name.Identifier.ValueText;

                if (baseStr == "transform")
                {
                    if (prop == "position")
                    {
                        if (rightVal is not Vector3D pos)
                        {
                            throw new Exception("transform.position requires a Vector3 value.");
                        }
                        AddCommand(new XrCommand("SetPosition", "currentObject", Position: pos, Object: "currentObject", X: pos.X, Y: pos.Y, Z: pos.Z));
                    }
                    else if (prop == "localScale")
                    {
                        if (rightVal is not Vector3D scale)
                        {
                            throw new Exception("transform.localScale requires a Vector3 value.");
                        }
                        AddCommand(new XrCommand("SetScale", "currentObject", Scale: scale, Object: "currentObject", X: scale.X, Y: scale.Y, Z: scale.Z));
                    }
                    else if (prop == "rotation")
                    {
                        if (rightVal is not Vector3D rot)
                        {
                            throw new Exception("transform.rotation requires a Quaternion.Euler value.");
                        }
                        AddCommand(new XrCommand("SetRotation", "currentObject", Object: "currentObject", X: rot.X, Y: rot.Y, Z: rot.Z));
                    }
                    else
                    {
                        throw new Exception($"Property transform.{prop} is not supported.");
                    }
                }
                else
                {
                    throw new Exception($"Assignment to '{memberAccess}' is not supported.");
                }
            }
        }

        private void InterpretInvocation(InvocationExpressionSyntax invocation)
        {
            AstNodes.Add(nameof(InvocationExpressionSyntax));
            var symbol = _semanticModel.GetSymbolInfo(invocation).Symbol as IMethodSymbol;
            if (symbol == null)
            {
                throw new Exception("Unresolved method call.");
            }

            var containingType = symbol.ContainingType?.ToString();
            var methodName = symbol.Name;

            if (containingType == "xr")
            {
                var args = invocation.ArgumentList.Arguments;
                if (methodName is "CreateCube" or "CreateSphere" or "CreateCylinder")
                {
                    if (args.Count != 3)
                    {
                        throw new Exception($"xr.{methodName} requires exactly 3 arguments.");
                    }

                    var nameVal = EvaluateExpression(args[0].Expression) as string;
                    if (string.IsNullOrEmpty(nameVal))
                    {
                        throw new Exception($"xr.{methodName} requires a valid non-empty string object name.");
                    }
                    ValidateObjectName(nameVal);

                    var posVal = EvaluateExpression(args[1].Expression) as Vector3D;
                    if (posVal == null)
                    {
                        throw new Exception($"xr.{methodName} requires a valid Vector3 position.");
                    }

                    var scaleVal = EvaluateExpression(args[2].Expression) as Vector3D;
                    if (scaleVal == null)
                    {
                        throw new Exception($"xr.{methodName} requires a valid Vector3 scale.");
                    }

                    CreatedObjects.Add(nameVal);
                    if (CreatedObjects.Count > 20)
                    {
                        throw new Exception("Maximum XR object limit exceeded.");
                    }

                    AddCommand(new XrCommand(
                        Type: methodName,
                        Name: nameVal,
                        Position: posVal,
                        Scale: scaleVal,
                        Object: nameVal,
                        X: posVal.X, Y: posVal.Y, Z: posVal.Z,
                        ScaleX: scaleVal.X, ScaleY: scaleVal.Y, ScaleZ: scaleVal.Z
                    ));
                }
                else if (methodName == "Rotate")
                {
                    if (args.Count != 4)
                    {
                        throw new Exception("xr.Rotate requires exactly 4 arguments.");
                    }

                    var nameVal = EvaluateExpression(args[0].Expression) as string;
                    if (string.IsNullOrEmpty(nameVal))
                    {
                        throw new Exception("xr.Rotate requires a valid non-empty string object name.");
                    }
                    ValidateObjectName(nameVal);

                    var x = EvaluateExpression(args[1].Expression);
                    var y = EvaluateExpression(args[2].Expression);
                    var z = EvaluateExpression(args[3].Expression);

                    if (x is double dx && y is double dy && z is double dz && double.IsFinite(dx) && double.IsFinite(dy) && double.IsFinite(dz))
                    {
                        AddCommand(new XrCommand(
                            Type: "Rotate",
                            Name: nameVal,
                            X: dx, Y: dy, Z: dz,
                            Object: nameVal
                        ));
                    }
                    else
                    {
                        throw new Exception("xr.Rotate requires three finite numeric angle arguments.");
                    }
                }
                else if (methodName == "SetPosition")
                {
                    if (args.Count != 2)
                    {
                        throw new Exception("xr.SetPosition requires exactly 2 arguments.");
                    }

                    var nameVal = EvaluateExpression(args[0].Expression) as string;
                    if (string.IsNullOrEmpty(nameVal))
                    {
                        throw new Exception("xr.SetPosition requires a valid non-empty string object name.");
                    }
                    ValidateObjectName(nameVal);

                    var posVal = EvaluateExpression(args[1].Expression) as Vector3D;
                    if (posVal == null)
                    {
                        throw new Exception("xr.SetPosition requires a valid Vector3 position.");
                    }

                    AddCommand(new XrCommand(
                        Type: "SetPosition",
                        Name: nameVal,
                        Position: posVal,
                        Object: nameVal,
                        X: posVal.X, Y: posVal.Y, Z: posVal.Z
                    ));
                }
                else if (methodName == "SetScale")
                {
                    if (args.Count != 2)
                    {
                        throw new Exception("xr.SetScale requires exactly 2 arguments.");
                    }

                    var nameVal = EvaluateExpression(args[0].Expression) as string;
                    if (string.IsNullOrEmpty(nameVal))
                    {
                        throw new Exception("xr.SetScale requires a valid non-empty string object name.");
                    }
                    ValidateObjectName(nameVal);

                    var scaleVal = EvaluateExpression(args[1].Expression) as Vector3D;
                    if (scaleVal == null)
                    {
                        throw new Exception("xr.SetScale requires a valid Vector3 scale.");
                    }

                    AddCommand(new XrCommand(
                        Type: "SetScale",
                        Name: nameVal,
                        Scale: scaleVal,
                        Object: nameVal,
                        X: scaleVal.X, Y: scaleVal.Y, Z: scaleVal.Z
                    ));
                }
            }
            else if (containingType == "UnityEngine.Transform" && methodName == "Rotate")
            {
                var args = invocation.ArgumentList.Arguments;
                if (args.Count != 3)
                {
                    throw new Exception("transform.Rotate requires exactly 3 numeric arguments.");
                }

                var x = EvaluateExpression(args[0].Expression);
                var y = EvaluateExpression(args[1].Expression);
                var z = EvaluateExpression(args[2].Expression);

                if (x is double dx && y is double dy && z is double dz)
                {
                    AddCommand(new XrCommand(
                        Type: "Rotate",
                        Name: "currentObject",
                        X: dx, Y: dy, Z: dz,
                        Object: "currentObject"
                    ));
                }
                else
                {
                    throw new Exception("transform.Rotate arguments must evaluate to numeric values.");
                }
            }
        }

        private void AddCommand(XrCommand cmd)
        {
            Commands.Add(cmd);
            if (Commands.Count > 50)
            {
                throw new Exception("Maximum XR command limit exceeded.");
            }
        }

        private static void ValidateObjectName(string name)
        {
            if (name == "currentObject" || name.Length is < 1 or > 32)
            {
                throw new Exception("Invalid object name: name must be between 1 and 32 characters, and cannot be 'currentObject'.");
            }

            if (name.Any(character => !char.IsLetterOrDigit(character) && character != '_' && character != '-'))
            {
                throw new Exception("Invalid object name: only letters, digits, underscores, and hyphens are allowed.");
            }
        }

        private object? EvaluateExpression(ExpressionSyntax expression)
        {
            while (expression is ParenthesizedExpressionSyntax parenthesized)
            {
                expression = parenthesized.Expression;
            }

            if (expression is LiteralExpressionSyntax literal)
            {
                var val = literal.Token.Value;
                if (val is double d) return d;
                if (val is float f) return (double)f;
                if (val is int i) return (double)i;
                if (val is long l) return (double)l;
                if (val is decimal dec) return (double)dec;
                if (val is string s) return s;
                if (val is bool b) return b;
                return val;
            }

            if (expression is IdentifierNameSyntax identifier)
            {
                var name = identifier.Identifier.ValueText;
                if (_variables.TryGetValue(name, out var val))
                {
                    return val;
                }
                throw new Exception($"Variable '{name}' is not declared or initialized.");
            }

            if (expression is PrefixUnaryExpressionSyntax unary)
            {
                var operandVal = EvaluateExpression(unary.Operand);
                if (unary.IsKind(SyntaxKind.UnaryMinusExpression))
                {
                    if (operandVal is double d) return -d;
                    throw new Exception("Unary minus operator can only be applied to numeric values.");
                }
                if (unary.IsKind(SyntaxKind.UnaryPlusExpression))
                {
                    return operandVal;
                }
            }

            if (expression is BinaryExpressionSyntax binary)
            {
                var leftVal = EvaluateExpression(binary.Left);
                var rightVal = EvaluateExpression(binary.Right);

                if (leftVal is double lNum && rightVal is double rNum)
                {
                    return binary.Kind() switch
                    {
                        SyntaxKind.AddExpression => lNum + rNum,
                        SyntaxKind.SubtractExpression => lNum - rNum,
                        SyntaxKind.MultiplyExpression => lNum * rNum,
                        SyntaxKind.DivideExpression => rNum == 0 ? throw new Exception("Division by zero.") : lNum / rNum,
                        _ => throw new Exception($"Unsupported binary operator: {binary.OperatorToken.Text}")
                    };
                }
                throw new Exception("Binary arithmetic operations are only supported between numeric values.");
            }

            if (expression is ObjectCreationExpressionSyntax creation)
            {
                AstNodes.Add(nameof(ObjectCreationExpressionSyntax));
                var typeSymbol = _semanticModel.GetTypeInfo(creation).Type;
                if (typeSymbol == null || typeSymbol.ToString() != "UnityEngine.Vector3")
                {
                    throw new Exception($"Object creation of type '{creation.Type}' is not supported. Only 'Vector3' is allowed.");
                }

                var args = creation.ArgumentList?.Arguments ?? default;
                if (args.Count != 3)
                {
                    throw new Exception("Vector3 constructor requires exactly 3 numeric arguments.");
                }

                var x = EvaluateExpression(args[0].Expression);
                var y = EvaluateExpression(args[1].Expression);
                var z = EvaluateExpression(args[2].Expression);

                if (x is double dx && y is double dy && z is double dz)
                {
                    return new Vector3D(dx, dy, dz);
                }
                throw new Exception("Vector3 constructor arguments must evaluate to numeric values.");
            }

            if (expression is MemberAccessExpressionSyntax memberAccess)
            {
                var baseVal = EvaluateExpression(memberAccess.Expression);
                if (baseVal is Vector3D vec)
                {
                    var propName = memberAccess.Name.Identifier.ValueText.ToLowerInvariant();
                    return propName switch
                    {
                        "x" => vec.X,
                        "y" => vec.Y,
                        "z" => vec.Z,
                        _ => throw new Exception($"Vector3 does not contain a property named '{memberAccess.Name.Identifier.ValueText}'.")
                    };
                }

                throw new Exception($"Unsupported member access: {memberAccess}");
            }

            if (expression is InvocationExpressionSyntax invocation)
            {
                var methodSymbol = _semanticModel.GetSymbolInfo(invocation).Symbol as IMethodSymbol;
                if (methodSymbol != null && methodSymbol.ContainingType.ToString() == "UnityEngine.Quaternion" && methodSymbol.Name == "Euler")
                {
                    var args = invocation.ArgumentList.Arguments;
                    if (args.Count != 3)
                    {
                        throw new Exception("Quaternion.Euler requires exactly 3 numeric arguments.");
                    }
                    var x = EvaluateExpression(args[0].Expression);
                    var y = EvaluateExpression(args[1].Expression);
                    var z = EvaluateExpression(args[2].Expression);

                    if (x is double dx && y is double dy && z is double dz)
                    {
                        return new Vector3D(dx, dy, dz);
                    }
                    throw new Exception("Quaternion.Euler arguments must evaluate to numeric values.");
                }
            }

            throw new Exception($"Expression of type '{expression.GetType().Name}' is not supported for evaluation.");
        }
    }
}
