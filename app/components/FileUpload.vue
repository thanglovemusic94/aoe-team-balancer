<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      📁 Upload File Excel
    </h2>
    
    <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.xls"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div v-if="!isProcessing" @click="$refs.fileInput.click()" class="cursor-pointer">
        <div class="text-6xl mb-4">📊</div>
        <p class="text-lg text-gray-600 mb-2">
          Click để chọn file Excel
        </p>
        <p class="text-sm text-gray-500">
          Hỗ trợ định dạng .xlsx và .xls
        </p>
      </div>
      
      <div v-else class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Đang xử lý file...</span>
      </div>
    </div>
    
    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
    
    <div v-if="success" class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ success }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'

const emit = defineEmits(['file-uploaded'])

const isProcessing = ref(false)
const error = ref('')
const success = ref('')

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  isProcessing.value = true
  error.value = ''
  success.value = ''
  
  try {
    const data = await readExcelFile(file)
    
    // Validate data quantity
    if (data.length === 0) {
      throw new Error('File không chứa dữ liệu nào.')
    }
    
    if (data.length !== 28) {
      throw new Error(`File phải chứa đúng 28 người chơi. Hiện tại có ${data.length} người.`)
    }
    
    // Validate structure
    const invalidRows = data.filter(row => !row.name || !row.rank || isNaN(row.rank))
    if (invalidRows.length > 0) {
      throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra cấu trúc file Excel (Cột 1: Điểm, Cột 2: Tên).')
    }
    
    // Validate rank range
    const ranks = data.map(row => row.rank)
    const minRank = Math.min(...ranks)
    const maxRank = Math.max(...ranks)
    if (minRank < 1 || maxRank > 23) {
      throw new Error(`Điểm số không hợp lệ. Phải trong khoảng 1-23. Hiện tại: ${minRank}-${maxRank}`)
    }
    
    // Validate duplicate names
    const names = data.map(row => row.name)
    const uniqueNames = new Set(names)
    if (uniqueNames.size !== names.length) {
      throw new Error('Có tên người chơi bị trùng lặp. Vui lòng kiểm tra lại.')
    }
    
    success.value = `✅ Đã đọc thành công ${data.length} người chơi!`
    emit('file-uploaded', data)
    
  } catch (err) {
    error.value = err.message || 'Lỗi không xác định khi đọc file.'
  } finally {
    isProcessing.value = false
  }
}

const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        // Kiểm tra file có sheet không
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('File Excel không chứa sheet nào.'))
          return
        }
        
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Kiểm tra worksheet có dữ liệu không
        if (!worksheet) {
          reject(new Error('Sheet đầu tiên không có dữ liệu.'))
          return
        }
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // Kiểm tra có dữ liệu không
        if (!jsonData || jsonData.length === 0) {
          reject(new Error('File không chứa dữ liệu nào.'))
          return
        }
        
        // Skip header row if exists and convert to our format
        const players = []
        const startRow = jsonData[0] && (typeof jsonData[0][0] === 'string' && jsonData[0][0].toLowerCase().includes('điểm')) ? 1 : 0
        
        for (let i = startRow; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (row && row.length >= 2 && row[0] != null && row[1] != null) {
            const rank = parseInt(row[0])
            const name = String(row[1]).trim()
            
            // Bỏ qua dòng trống
            if (!isNaN(rank) && name) {
              players.push({
                rank: rank,
                name: name
              })
            }
          }
        }
        
        resolve(players)
      } catch (err) {
        reject(new Error(`Không thể đọc file Excel: ${err.message || 'Định dạng file không hợp lệ'}`))
      }
    }
    
    reader.onerror = (err) => {
      reject(new Error(`Lỗi khi đọc file: ${err.message || 'Không thể đọc file'}`))
    }
    
    reader.readAsBinaryString(file)
  })
}
</script>
