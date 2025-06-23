export async function safeDownload(e, fileUrl) {
  e.preventDefault(); // ⛔ Prevent default <a> behavior
  try {
    const res = await fetch(fileUrl, { method: 'HEAD' });
    if (!res.ok) {
      alert('❌ File not found');
      return;
    }
    // ✅ Trigger forced download
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = ''; // Use browser default filename
    a.target = '_self'; // Prevent opening in new tab
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    alert('❌ File not found');
  }
}
