namespace Restaurant.PrintAgent;

public class PrintAgentOptions
{
    public const string SectionName = "PrintAgent";

    public string ApiBaseUrl { get; set; } = "http://localhost:5141";
    public string AgentKey { get; set; } = string.Empty;
    public int PollingIntervalSeconds { get; set; } = 3;
    public string PrintMode { get; set; } = "Mock";
    public string? PrinterType { get; set; }
    public string? PrinterHost { get; set; }
    public int PrinterPort { get; set; } = 9100;
    public int Limit { get; set; } = 10;
}
