using System.Text.Json.Serialization;

namespace XrCodingLab.Server.Models;

public sealed record Vector3D(double X, double Y, double Z);

public sealed record XrCommand(
    string Type,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    string? Name = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    Vector3D? Position = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    Vector3D? Scale = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    Vector3D? Rotation = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    string? Object = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    double? X = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    double? Y = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    double? Z = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    double? ScaleX = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    double? ScaleY = null,
    
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    double? ScaleZ = null);

public sealed record ExecuteRequest(string Source);

public sealed record CodeIssue(string Kind, string Message, int Line, int Column);

public sealed record ExecuteResponse(
    IReadOnlyList<XrCommand> Commands,
    IReadOnlyList<CodeIssue> Errors,
    IReadOnlyList<string> AstNodes,
    int SyntaxNodeCount);
