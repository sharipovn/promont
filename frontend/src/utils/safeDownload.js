export async function safeDownload(e, fileUrl, returnTitle = null) {
  e.preventDefault();

  const showTooltip = (message, targetEl) => {
    if (!targetEl) return;

    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    const rect = targetEl.getBoundingClientRect();

    tooltip.style.position = 'absolute';
    tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.background = '#dc3545';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = 9999;
    tooltip.style.pointerEvents = 'none';

    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 2000);
  };

  try {
    if (!fileUrl) throw new Error("Invalid URL");

    console.log("🟢 Checking file:", fileUrl);

    const res = await fetch(fileUrl, { method: 'HEAD' }); // ✅ HEAD to check without downloading
    if (!res.ok) throw new Error("File not found");

    console.log("✅ File exists, triggering download");

    const a = document.createElement('a');
    a.href = fileUrl;
    a.setAttribute('target', '_blank'); // Optional: open in new tab
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('download', fileUrl.split('/').pop());
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error("❌ File download error:", err.message || err);
    showTooltip(
      returnTitle ? returnTitle('file.file_is_lost') : '❌ File not found',
      e.currentTarget || e.target
    );
  }
}
