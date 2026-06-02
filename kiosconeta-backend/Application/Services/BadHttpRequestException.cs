namespace Application.Services
{
    [Serializable]
    internal class BadHttpRequestException : Exception
    {
        public BadHttpRequestException()
        {
        }

        public BadHttpRequestException(string? message) : base(message)
        {
        }

        public BadHttpRequestException(string? message, Exception? innerException) : base(message, innerException)
        {
        }
    }
}