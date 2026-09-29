using System.ComponentModel.DataAnnotations;
using FanHub.Domain.Entities;

namespace FanHub.Application.DTOs.Category
{
    public class CategoryForCreation
    {
        [Required, MaxLength(80)]
        public string Name { get; set; } = "";

        [MaxLength(2000)]
        public string Description { get; set; } = "";

        public CategoryForCreation()
        {
        }

        public CategoryForCreation(string name, string description)
        {
            this.Name = name;
            this.Description = description;
        }
    }
}
