export const exportNerdFile = async (dataStr, filename = "match.nerd") => {
  try {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Nerd Hub Match',
          accept: { 'application/x-nerd-match': ['.nerd'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(dataStr);
      await writable.close();
    } else {
      const blob = new Blob([dataStr], { type: 'application/x-nerd-match' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    if (error.name !== 'AbortError') console.error("Export failed:", error);
  }
};

export const importNerdFile = async (fileOrHandle) => {
  try {
    let text = "";
    if (fileOrHandle.getFile) {
      const file = await fileOrHandle.getFile();
      text = await file.text();
    } else if (fileOrHandle instanceof File) {
      text = await fileOrHandle.text();
    }
    return text;
  } catch (error) {
    console.error("Import failed:", error);
    return null;
  }
};
