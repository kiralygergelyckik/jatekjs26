using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Tavolugras
{
    public partial class Form1 : Form
    {
        List<Student> students = new List<Student>();

        public Form1()
        {
            InitializeComponent();
        }

        private void UpdateListBox(List<Student> list = null) 
        {
            listBox.DataSource = null;
            listBox.DataSource = list ?? students;
        }

        private void AddButon_Click(object sender, EventArgs e)
        {
            Student student = new Student(NameTextBox.Text, CityTextBox.Text, ResultsTextBox.Text);
            students.Add(student);
            UpdateListBox(students);
        }

        private void listBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (listBox.SelectedItem == null) return;

            Student student = listBox.SelectedItem as Student;

            NameTextBox.Text = student.Name;
            CityTextBox.Text = student.City;

            JumpCountLabel.Text = "Érvényes ugrások száma: " + student.JumpCount();
            AvaerageDistanceLabel.Text = "Átlagos távolság: " + student.AverageDistance();
            MaxDistanceLabel.Text = "Legnagyobb távolság: " + student.MaxStep();

            ResultsTextBox.Text = String.Join(" ", student.Results);
        }

        private void szurcsibox_TextChanged(object sender, EventArgs e)
        {
            string filter = szurcsibox.Text.ToLower();

            var f = students
                .Where(x => x.City.ToLower().Contains(filter))
                .ToList();

            UpdateListBox(f);
        }

        private void numericUpDown_ValueChanged(object sender, EventArgs e)
        {
            int num = Convert.ToInt32(numericUpDown.Value);

            var f = students.Take(num).ToList();

            UpdateListBox(f);
        }

        private void radioButton_CheckedChanged(object sender, EventArgs e)
        {
            RadioButton rb = sender as RadioButton;
            if (!rb.Checked) return;

            if (rb.Tag.ToString() == "max")
            {
                students = students
                    .OrderByDescending(x => x.MaxStep())
                    .ToList();
            }
            else
            {
                students = students
                    .OrderByDescending(x => x.AverageDistance())
                    .ToList();
            }

            UpdateListBox();
        }

        private void mentésToolStripMenuItem1_Click(object sender, EventArgs e)
        {
            SaveFileDialog dialog = new SaveFileDialog();
            dialog.Filter = "Szöveges fájl|*.txt";

            if (dialog.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    using (StreamWriter wr = new StreamWriter(dialog.FileName))
                    {
                        foreach (var student in students)
                        {
                            wr.Write(student.Name + ";" + student.City + ";");
                            wr.WriteLine(string.Join(";", student.Results));
                        }
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Hiba történt mentéskor:\n" + ex.Message);
                }
            }
        }

        private void betöltésToolStripMenuItem_Click(object sender, EventArgs e)
        {
            OpenFileDialog dialog = new OpenFileDialog();
            dialog.Filter = "Szöveges fájl|*.txt";

            if (dialog.ShowDialog() == DialogResult.OK)
            {
                string extension = Path.GetExtension(dialog.FileName);

                if (extension != ".txt")
                {
                    MessageBox.Show("Nem megfelelő fájlformátum!",
                        "Hiba",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error);
                    return;
                }

                try
                {
                    students.Clear();

                    using (StreamReader sr = new StreamReader(dialog.FileName))
                    {
                        while (!sr.EndOfStream)
                        {
                            string[] temp = sr.ReadLine().Split(';');

                            string name = temp[0];
                            string city = temp[1];

                            string results = string.Join(" ", temp.Skip(2));

                            students.Add(new Student(name, city, results));
                        }
                    }

                    UpdateListBox();
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Hiba történt betöltéskor:\n" + ex.Message);
                }
            }
        }
    }
}
