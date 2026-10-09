using Npgsql;

namespace JobTracker.Api.Infrastructure
{
    public static class PostgresConnectionString
    {
        /// <summary>
        /// Hosted databases (Neon, Supabase, Render) hand out a URL such as
        /// postgresql://user:password@host/dbname?sslmode=require, which Npgsql cannot read.
        /// This turns such a URL into a normal connection string; any other value is returned unchanged.
        /// </summary>
        public static string? Normalize(string? value)
        {
            if (string.IsNullOrWhiteSpace(value) ||
                !(value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                  value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)))
            {
                return value;
            }

            var uri = new Uri(value);
            var credentials = uri.UserInfo.Split(':', 2);

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.IsDefaultPort || uri.Port < 0 ? 5432 : uri.Port,
                Database = uri.AbsolutePath.TrimStart('/'),
                Username = Uri.UnescapeDataString(credentials[0]),
                Password = credentials.Length > 1 ? Uri.UnescapeDataString(credentials[1]) : null
            };

            // Hosted databases require TLS; honour an explicit sslmode=disable only
            var wantsTls = !uri.Query.Contains("sslmode=disable", StringComparison.OrdinalIgnoreCase);
            if (wantsTls)
                builder.SslMode = SslMode.Require;

            return builder.ConnectionString;
        }
    }
}
