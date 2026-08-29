using Microsoft.AspNetCore.Mvc;
using XrCodingLab.Server.Interpreting;
using XrCodingLab.Server.Models;

namespace XrCodingLab.Server.Controllers;

[ApiController]
[Route("api/execute")]
public sealed class ExecuteController(UnityTransformInterpreter interpreter) : ControllerBase
{
    [HttpPost]
    public ActionResult<ExecuteResponse> Execute([FromBody] ExecuteRequest? request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Source))
        {
            return Ok(new ExecuteResponse([], [new CodeIssue("runtime", "Source code is required.", 1, 1)], [], 0));
        }

        try
        {
            var response = interpreter.Interpret(request.Source);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return Ok(new ExecuteResponse([], [new CodeIssue("runtime", $"Internal server error: {ex.Message}", 1, 1)], [], 0));
        }
    }
}
