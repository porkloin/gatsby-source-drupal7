const axios = require(`axios`)
const crypto = require(`crypto`)
const _ = require(`lodash`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const { URL } = require(`url`)
const { nodeFromData } = require(`./normalize`)

// Get content digest of node.
const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

exports.sourceNodes = async (
  { actions, getNode, hasNodeChanged, store, cache, createNodeId },
  { baseUrl, apiBase, basicAuth }
) => {
  const { createNode } = actions

  // Default apiBase to `jsonapi`
  apiBase = apiBase || `restws_resource.json`

  // Fetch articles.
  // console.time(`fetch Drupal data`)
  console.log(`Starting to fetch data from Drupal`)

  const data = await axios.get(`${baseUrl}/${apiBase}`, { auth: basicAuth })
  const allData = await Promise.all(
    _.map(data.data.list, async (listItem) => {
      let resourceName = listItem.name;
      let url = `${baseUrl}${listItem.path}`;
      if (listItem.name === 'restws_resource') return
      /*
      if (type === `self`) return
      if (!type) return
      */
      const getNext = async (nextUrl, data = []) => {
        let d
        try {
          d = await axios.get(`${nextUrl}`, { auth: basicAuth })
        } catch (error) {
          if (error.response && error.response.status == 405) {
            // The endpoint doesn't support the GET method, so just skip it.
            return []
          } else if (error.response && error.response.status == 403) {
            // We can't access that resource, 403.
            console.warn(`WARN: Access denied. Failed to fetch ${url} `, error.message);
            console.log('Proceeding anyway, but you should ensure you do not need access to this resource.');
            // Skip it, but warn the user.
            return []
          } else {
            console.error(`Failed to fetch ${url}`, error.message)
            console.log(error.data)
            throw error
          }
        }
        data = data.concat(d.data.list)
        if (!data.name) {
          data.name = resourceName;
        }
        if (d.data.next && d.data.self !== d.data.last) {
          data = await getNext(d.data.next, data)
        }

        return data
      }

      const data = await getNext(url)

      const result = {
        data,
      }

      // eslint-disable-next-line consistent-return
      return result
    })
  )

  // Process nodes
  const nodes = []
  _.each(allData, contentType => {
    if (!contentType) return
    let resourceName = contentType.data.name;
    _.each(contentType.data, datum => {
      if (!datum) return
      const node = nodeFromData(datum, createNodeId, resourceName)

      node.internal.contentDigest = createContentDigest(node)
      nodes.push(node)
    })
  })

  // TODO: figure out what is going on with files - restws throws 403 for everyone (even admin)?
  // Download all files.
  /*await Promise.all(
    nodes.map(async node => {
      let fileNode
      if (
        node.internal.type === `files` ||
        node.internal.type === `file__file`
      ) {
        try {
          let fileUrl = node.url
          if (typeof node.uri === `object`) {
            // Support JSON API 2.x file URI format https://www.drupal.org/node/2982209
            fileUrl = node.uri.url
          }
          // Resolve w/ baseUrl if node.uri isn't absolute.
          const url = new URL(fileUrl, baseUrl)
          // If we have basicAuth credentials, add them to the request.
          const auth =
            typeof basicAuth === `object`
              ? {
                  htaccess_user: basicAuth.username,
                  htaccess_pass: basicAuth.password,
                }
              : {}
          fileNode = await createRemoteFileNode({
            url: url.href,
            store,
            cache,
            createNode,
            createNodeId,
            auth,
          })
        } catch (e) {
          // Ignore
        }
        if (fileNode) {
          node.localFile___NODE = fileNode.id
        }
      }
    })
  )*/

  nodes.forEach(n => createNode(n))
}
