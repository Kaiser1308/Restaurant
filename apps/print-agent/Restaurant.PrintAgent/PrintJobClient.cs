using System.Net.Http.Json;
using Microsoft.Extensions.Options;

namespace Restaurant.PrintAgent;

public class PrintJobClient
{
    private readonly HttpClient _httpClient;
    private readonly PrintAgentOptions _options;
    private readonly ILogger<PrintJobClient> _logger;

    public PrintJobClient(HttpClient httpClient, IOptions<PrintAgentOptions> options, ILogger<PrintJobClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<List<PrintJobResponse>> GetPendingAsync(CancellationToken cancellationToken)
    {
        var printerTypeParam = string.IsNullOrWhiteSpace(_options.PrinterType)
            ? ""
            : $"&printerType={Uri.EscapeDataString(_options.PrinterType)}";

        var url = $"/api/print-jobs/pending?limit={_options.Limit}{printerTypeParam}";

        _logger.LogDebug("Fetching pending print jobs from {Url}", url);

        var response = await _httpClient.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();

        var jobs = await response.Content.ReadFromJsonAsync<List<PrintJobResponse>>(cancellationToken);
        return jobs ?? [];
    }

    public async Task MarkPrintingAsync(Guid id, CancellationToken cancellationToken)
    {
        var url = $"/api/print-jobs/{id}/mark-printing";
        _logger.LogDebug("Marking print job {Id} as printing", id);

        var response = await _httpClient.PostAsync(url, null, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task MarkPrintedAsync(Guid id, CancellationToken cancellationToken)
    {
        var url = $"/api/print-jobs/{id}/mark-printed";
        _logger.LogDebug("Marking print job {Id} as printed", id);

        var response = await _httpClient.PostAsync(url, null, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task MarkFailedAsync(Guid id, string errorMessage, CancellationToken cancellationToken)
    {
        var url = $"/api/print-jobs/{id}/mark-failed";
        _logger.LogDebug("Marking print job {Id} as failed: {Error}", id, errorMessage);

        var body = new MarkPrintJobFailedRequest { ErrorMessage = errorMessage };
        var response = await _httpClient.PostAsJsonAsync(url, body, cancellationToken);
        response.EnsureSuccessStatusCode();
    }
}
