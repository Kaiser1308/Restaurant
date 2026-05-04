using Restaurant.PrintAgent;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<PrintAgentOptions>(
    builder.Configuration.GetSection(PrintAgentOptions.SectionName));

var options = builder.Configuration
    .GetSection(PrintAgentOptions.SectionName)
    .Get<PrintAgentOptions>() ?? new PrintAgentOptions();

builder.Services.AddHttpClient<PrintJobClient>(client =>
{
    client.BaseAddress = new Uri(options.ApiBaseUrl);
    client.DefaultRequestHeaders.Add("X-Print-Agent-Key", options.AgentKey);
});

builder.Services.AddSingleton<TicketFormatter>();
builder.Services.AddSingleton<EscPosTcpPrinter>();
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
