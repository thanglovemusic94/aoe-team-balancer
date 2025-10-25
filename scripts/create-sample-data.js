import XLSX from 'xlsx';

// Tạo dữ liệu mẫu
const sampleData = [
  ['Điểm', 'Tên'],
  [23, 'Player1'],
  [22, 'Player2'],
  [21, 'Player3'],
  [20, 'Player4'],
  [19, 'Player5'],
  [18, 'Player6'],
  [17, 'Player7'],
  [16, 'Player8'],
  [15, 'Player9'],
  [14, 'Player10'],
  [13, 'Player11'],
  [12, 'Player12'],
  [11, 'Player13'],
  [10, 'Player14'],
  [9, 'Player15'],
  [8, 'Player16'],
  [7, 'Player17'],
  [6, 'Player18'],
  [5, 'Player19'],
  [4, 'Player20'],
  [3, 'Player21'],
  [2, 'Player22'],
  [1, 'Player23'],
  [23, 'Player24'],
  [22, 'Player25'],
  [21, 'Player26'],
  [20, 'Player27'],
  [19, 'Player28']
];

// Tạo workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(sampleData);
XLSX.utils.book_append_sheet(wb, ws, 'Players');

// Ghi file
XLSX.writeFile(wb, 'public/sample-data.xlsx');
console.log('Sample Excel file created successfully!');
