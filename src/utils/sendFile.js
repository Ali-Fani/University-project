function sendFile(res, file, metadata) {
  res.setHeader('Content-Type', metadata.mimetype);
  res.setHeader('Content-Disposition', `attachment;filename="${metadata.originalName}"`);
  res.send(file);
}

module.exports = { sendFile };
