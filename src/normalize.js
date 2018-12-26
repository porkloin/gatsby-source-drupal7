const nodeFromData = (datum, createNodeId, resourceName) => {
  //const { attributes: { id: _attributes_id, ...attributes } = {} } = datum
  //const preservedId = typeof _attributes_id !== `undefined` ? { _attributes_id } : {}
  if (resourceName === 'file') {
    //prevent type namespace collision with Gatsby
    resourceName = 'files';
  }
  const backupId = Math.floor(Math.random() * 10);
  if (!datum.uuid) {
    console.log('No UUID found on this item.');
  }
  return {
    id: datum.uuid ? createNodeId(datum.uuid) : String(backupId),
    drupal_id: datum.uuid,
    parent: null,
    children: [],
    data: datum,
    internal: {
      type: resourceName ? resourceName : 'd7',
    },
  }
}

exports.nodeFromData = nodeFromData
