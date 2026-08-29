using XrCodingLab.Server.Interpreting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<UnityTransformInterpreter>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();
app.MapControllers();
app.Run();
