using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.Bookmark
{
    public class BookmarkForUpdation
    {
        [MaxLength(4000)]
        public string Note { get; set; } = "";

        public BookmarkForUpdation()
        {
        }

        public BookmarkForUpdation(string note)
        {
            this.Note = note;
        }
    }
}
