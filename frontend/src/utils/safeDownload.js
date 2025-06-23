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
    const res = await fetch(fileUrl);
    if (!res.ok) {
      showTooltip(returnTitle ? returnTitle('file.file_is_lost') : '❌ File not found', e.currentTarget || e.target);
      return;
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileUrl.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    showTooltip(returnTitle ? returnTitle('file.file_is_lost') : '❌ File not found', e.currentTarget || e.target);
  }
}
