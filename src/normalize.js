const nodeFromData = (datum, createNodeId) => {
  const { attributes: { id: _attributes_id, ...attributes } = {} } = datum
  const preservedId =
    typeof _attributes_id !== `undefined` ? { _attributes_id } : {}
  const backupId = Math.floor(Math.random() * 10);
  return {
    id: String(backupId),
    drupal_id: String(backupId),
    parent: null,
    children: [],
    ...attributes,
    ...preservedId,
    internal: {
      type:'d7',
    },
  }
}

exports.nodeFromData = nodeFromData
