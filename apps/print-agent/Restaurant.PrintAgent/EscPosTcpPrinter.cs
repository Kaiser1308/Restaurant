using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.Options;

namespace Restaurant.PrintAgent;

public class EscPosTcpPrinter
{
    private static readonly byte[] InitCommand = [0x1B, 0x40];
    private static readonly byte[] CutCommand = [0x1D, 0x56, 0x00];

    private readonly PrintAgentOptions _options;

    public EscPosTcpPrinter(IOptions<PrintAgentOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendAsync(string text, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.PrinterHost))
        {
            throw new InvalidOperationException("PrintAgent:PrinterHost is required when PrintMode is Real.");
        }

        using var client = new TcpClient();
        await client.ConnectAsync(_options.PrinterHost, _options.PrinterPort, cancellationToken);

        await using var stream = client.GetStream();
        await stream.WriteAsync(InitCommand, cancellationToken);
        await stream.WriteAsync(Encoding.UTF8.GetBytes(text), cancellationToken);
        await stream.WriteAsync(CutCommand, cancellationToken);
        await stream.FlushAsync(cancellationToken);
    }
}
