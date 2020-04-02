using System;
using Xunit;

namespace Library.Tests
{
    public class DeepThoughtTests
    {
        [Fact]
        public void Can_get_answer()
        {
            var actual = DeepThought.GetAnswer();

            Assert.Equal(42, actual);
        }
    }
}
