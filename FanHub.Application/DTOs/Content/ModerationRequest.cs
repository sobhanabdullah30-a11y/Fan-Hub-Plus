using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.Content
{
    public class ModerationRequest
    {
        public bool Approve { get; set; }

        [MaxLength(2000)]
        public string? Note { get; set; }

        public ModerationRequest()
        {
        }

        public ModerationRequest(bool approve, string? note)
        {
            this.Approve = approve;
            this.Note = note;
        }
    }
}
