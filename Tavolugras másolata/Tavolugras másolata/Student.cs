using System;
using System.Collections.Generic;
using System.Linq;

namespace Tavolugras
{
    internal class Student
    {
        public string Name { get; set; }
        public string City { get; set; }
        public List<double> Results { get; set; }

        public Student(string name, string city, string results)
        {
            Name = name;
            City = city;
            Results = new List<double>();

            string[] temp = results.Split(' ', ';');

            foreach (var item in temp)
            {
                if (double.TryParse(item, out double value))
                {
                    Results.Add(value);
                }
            }
        }

        public int JumpCount()
        {
            return Results.Count(x => x != 0);
        }

        public double AverageDistance()
        {
            var valid = Results.Where(x => x != 0);
            if (!valid.Any()) return 0;
            return valid.Average();
        }

        public double MaxStep()
        {
            if (!Results.Any()) return 0;
            return Results.Max();
        }

        public override string ToString()
        {
            return $"{Name} ({City})";
        }
    }
}