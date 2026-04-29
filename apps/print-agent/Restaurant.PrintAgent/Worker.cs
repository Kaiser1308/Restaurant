namespace Restaurant.PrintAgent;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IConfiguration _configuration;

    public Worker(ILogger<Worker> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var printMode = _configuration["PrintAgent:PrintMode"] ?? "Mock";
        var pollingInterval = int.TryParse(_configuration["PrintAgent:PollingIntervalSeconds"], out var interval)
            ? interval
            : 3;

        _logger.LogInformation("Restaurant Print Agent started in {Mode} mode. Polling interval: {Interval}s", printMode, pollingInterval);

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Restaurant Print Agent running in {Mode} mode", printMode);
            await Task.Delay(pollingInterval * 1000, stoppingToken);
        }
    }
}
