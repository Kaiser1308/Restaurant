using Microsoft.Extensions.Options;

namespace Restaurant.PrintAgent;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly PrintJobClient _printJobClient;
    private readonly TicketFormatter _ticketFormatter;
    private readonly PrintAgentOptions _options;

    public Worker(
        ILogger<Worker> logger,
        PrintJobClient printJobClient,
        TicketFormatter ticketFormatter,
        IOptions<PrintAgentOptions> options)
    {
        _logger = logger;
        _printJobClient = printJobClient;
        _ticketFormatter = ticketFormatter;
        _options = options.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Restaurant Print Agent started in {Mode} mode. Polling interval: {Interval}s",
            _options.PrintMode, _options.PollingIntervalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var jobs = await _printJobClient.GetPendingAsync(stoppingToken);

                if (jobs.Count > 0)
                {
                    _logger.LogInformation("Found {Count} pending print job(s)", jobs.Count);
                }

                foreach (var job in jobs)
                {
                    try
                    {
                        await _printJobClient.MarkPrintingAsync(job.Id, stoppingToken);

                        var ticket = _ticketFormatter.Format(job);
                        _logger.LogInformation("Printing ticket:\n{Ticket}", ticket);

                        await _printJobClient.MarkPrintedAsync(job.Id, stoppingToken);
                        _logger.LogInformation("Print job {Id} completed successfully", job.Id);
                    }
                    catch (Exception ex) when (ex is not OperationCanceledException)
                    {
                        _logger.LogError(ex, "Failed to process print job {Id}", job.Id);

                        try
                        {
                            await _printJobClient.MarkFailedAsync(job.Id, ex.Message, stoppingToken);
                        }
                        catch (Exception failEx) when (failEx is not OperationCanceledException)
                        {
                            _logger.LogError(failEx, "Failed to mark print job {Id} as failed", job.Id);
                        }
                    }
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Error polling for print jobs");
            }

            await Task.Delay(_options.PollingIntervalSeconds * 1000, stoppingToken);
        }
    }
}
