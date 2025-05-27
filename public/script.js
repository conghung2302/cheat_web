document.addEventListener('DOMContentLoaded', () => {
  const pasteArea = document.getElementById('pasteArea');
  const imageContainer = document.getElementById('imageContainer');
  const textInput = document.getElementById('textInput');
  const sendTextButton = document.getElementById('sendText');
  const textContainer = document.getElementById('textContainer');

  const downloadBtn = document.getElementById('downloadBtn');
  // Hàm hiển thị danh sách ảnh
  async function loadImages() {
    try {
      const response = await fetch('/images');
      const result = await response.json();
      console.log('Loaded images:', result.images);
      if (result.images && result.images.length > 0) {
        result.images.forEach(imageUrl => {
          const img = document.createElement('img');
          img.src = imageUrl;
          imageContainer.appendChild(img);
        });
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  // Hàm hiển thị danh sách text
  async function loadTexts() {
    try {
      const response = await fetch('/texts');
      const result = await response.json();
      console.log('Loaded texts:', result.texts);
      if (result.texts && result.texts.length > 0) {
        result.texts.forEach(text => {
          displayText(text);
        });
      }
    } catch (error) {
      console.error('Error loading texts:', error);
    }
  }

  // Hàm hiển thị một đoạn text trên giao diện
  function displayText(text) {
    const textItem = document.createElement('div');
    textItem.className = 'text-item';
    textItem.innerHTML = `<span>${new Date(text.timestamp).toLocaleString()}</span>: ${text.content}`;
    textContainer.appendChild(textItem);
  }
  downloadBtn.addEventListener('click', function () {
    // Gọi API download từ server
    window.location.href = '/download';
  });
  // Gọi khi trang được tải
  loadImages();
  loadTexts();

  // Xử lý paste ảnh
  pasteArea.addEventListener('paste', async (event) => {
    console.log('Paste event triggered');
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    console.log('Clipboard items:', items);
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        console.log('File:', file);
        const formData = new FormData();
        formData.append('image', file);
        try {
          const response = await fetch('/upload', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          console.log('Server response:', result);
          if (result.imageUrl) {
            console.log('Adding image with URL:', result.imageUrl);
            const img = document.createElement('img');
            img.src = result.imageUrl;
            imageContainer.appendChild(img);
          } else {
            alert('Failed to upload image');
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert('Error uploading image');
        }
      }
    }
  });

  // Xử lý gửi text bằng Enter
  textInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
      sendText();
    }
  });

  // Xử lý gửi text bằng nút Send
  sendTextButton.addEventListener('click', sendText);

  // Hàm gửi text
  async function sendText() {
    const content = textInput.value.trim();
    if (!content) {
      alert('Please enter some text');
      return;
    }
    try {
      const response = await fetch('/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      const result = await response.json();
      console.log('Server response (text):', result);
      if (result.content) {
        displayText(result);
        textInput.value = ''; // Xóa ô input sau khi gửi
      } else {
        alert('Failed to save text');
      }
    } catch (error) {
      console.error('Error saving text:', error);
      alert('Error saving text');
    }
  }
});