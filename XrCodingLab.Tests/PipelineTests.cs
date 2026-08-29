using System.Linq;
using XrCodingLab.Server.Interpreting;
using XrCodingLab.Server.Models;
using Xunit;

namespace XrCodingLab.Tests;

public class PipelineTests
{
    private readonly UnityTransformInterpreter _interpreter = new();

    [Fact]
    public void Test_A_ValidCreateCube()
    {
        var source = @"
using UnityEngine;
public class TestClass : MonoBehaviour
{
    void Start()
    {
        xr.CreateCube(""myCube"", new Vector3(1, 2, 3), new Vector3(4, 5, 6));
    }
}";
        var result = _interpreter.Interpret(source);

        Assert.Empty(result.Errors);
        Assert.Single(result.Commands);
        var cmd = result.Commands[0];
        Assert.Equal("CreateCube", cmd.Type);
        Assert.Equal("myCube", cmd.Name);
        Assert.NotNull(cmd.Position);
        Assert.Equal(1, cmd.Position.X);
        Assert.Equal(2, cmd.Position.Y);
        Assert.Equal(3, cmd.Position.Z);
        Assert.NotNull(cmd.Scale);
        Assert.Equal(4, cmd.Scale.X);
        Assert.Equal(5, cmd.Scale.Y);
        Assert.Equal(6, cmd.Scale.Z);
    }

    [Fact]
    public void Test_B_ValidRotate()
    {
        var source = @"
using UnityEngine;
public class TestClass : MonoBehaviour
{
    void Start()
    {
        xr.Rotate(""myCube"", 45, 90, 180);
    }
}";
        var result = _interpreter.Interpret(source);

        Assert.Empty(result.Errors);
        Assert.Single(result.Commands);
        var cmd = result.Commands[0];
        Assert.Equal("Rotate", cmd.Type);
        Assert.Equal("myCube", cmd.Name);
        Assert.Equal(45, cmd.X);
        Assert.Equal(90, cmd.Y);
        Assert.Equal(180, cmd.Z);
    }

    [Fact]
    public void Test_C_MultipleXrCommands()
    {
        var source = @"
using UnityEngine;
public class TestClass : MonoBehaviour
{
    void Start()
    {
        xr.CreateCube(""seat"", new Vector3(0, 1, 0), new Vector3(1, 1, 1));
        xr.Rotate(""seat"", 10, 20, 30);
        xr.SetPosition(""seat"", new Vector3(2, 2, 2));
        xr.SetScale(""seat"", new Vector3(3, 3, 3));
    }
}";
        var result = _interpreter.Interpret(source);

        Assert.Empty(result.Errors);
        Assert.Equal(4, result.Commands.Count);
        Assert.Equal("CreateCube", result.Commands[0].Type);
        Assert.Equal("Rotate", result.Commands[1].Type);
        Assert.Equal("SetPosition", result.Commands[2].Type);
        Assert.Equal("SetScale", result.Commands[3].Type);
    }

    [Fact]
    public void Test_D_InvalidCSharpSyntax()
    {
        var source = @"
using UnityEngine;
public class TestClass : MonoBehaviour
{
    void Start()
    {
        xr.CreateCube(""myCube"", new Vector3(1, 2, 3)
    }
}";
        var result = _interpreter.Interpret(source);

        Assert.NotEmpty(result.Errors);
        Assert.Contains(result.Errors, e => e.Kind == "syntax");
    }

    [Fact]
    public void Test_E_UnsupportedApiCall()
    {
        var source = @"
using UnityEngine;
using System.IO;
public class TestClass : MonoBehaviour
{
    void Start()
    {
        File.Delete(""somefile.txt"");
    }
}";
        var result = _interpreter.Interpret(source);

        Assert.NotEmpty(result.Errors);
        Assert.Contains(result.Errors, e => e.Kind == "unsupported");
        Assert.Contains(result.Errors, e => e.Message.Contains("File.Delete"));
    }

    [Fact]
    public void Test_F_InvalidArgumentType()
    {
        var source = @"
using UnityEngine;
public class TestClass : MonoBehaviour
{
    void Start()
    {
        xr.Rotate(""myCube"", ""forty-five"", 0, 0);
    }
}";
        var result = _interpreter.Interpret(source);

        Assert.NotEmpty(result.Errors);
        Assert.Contains(result.Errors, e => e.Kind == "syntax");
    }

    [Fact]
    public void Test_G_ExcessiveNumberOfCommands()
    {
        var source = @"
using UnityEngine;
public class TestClass : MonoBehaviour
{
    void Start()
    {
" + string.Join("\n", Enumerable.Range(0, 60).Select(i => $"xr.Rotate(\"obj{i % 5}\", 10, 0, 0);")) + @"
    }
}";
        var result = _interpreter.Interpret(source);

        Assert.NotEmpty(result.Errors);
        Assert.Contains(result.Errors, e => e.Kind == "runtime" && e.Message.Contains("limit exceeded"));
    }
}
