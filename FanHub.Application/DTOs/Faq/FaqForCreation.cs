using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.Faq
{
    public class FaqForCreation
    {
        [Required, MaxLength(500)]
        public string Question { get; set; } = "";

        [Required, MaxLength(8000)]
        public string Answer { get; set; } = "";
        public bool Published { get; set; }

        public FaqForCreation()
        {
        }

        public FaqForCreation(string question, string answer, bool published)
        {
            this.Question = question;
            this.Answer = answer;
            this.Published = published;
        }
    }
}
