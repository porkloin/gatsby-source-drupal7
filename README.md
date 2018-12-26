# gatsby-source-drupal7

A source plugin for Gatsby that pulls data from Drupal 7.

This source plugin has been forked from [gatsby-source-drupal](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-drupal) to extend functionality
to Drupal 7.

## Requirements:
Drupal 7 site with the following modules installed and enabled:

- [restws](https://www.drupal.org/project/restws)
- [restws_resource_discovery](https://www.drupal.org/project/restws_resource_discovery)
- [uuid](https://www.drupal.org/project/uuid)

## Install:
`npm install --save gatsby-source-drupal`

## Configuration:
```
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal7`,
      options: {
        baseUrl: `https://live-mydrupal7site.pantheonsite.io/`,
        apiBase: `restws_resource.json`, // optional, defaults to `restws_resource.json`
      },
    },
  ],
}
```

## Auth:
```
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-drupal7`,
      options: {
        baseUrl: `https://live-mydrupal7site.pantheonsite.io/`,
        apiBase: `restws_resource.json`, // optional, defaults to `restws_resource.json`
				basicAuth: {
          username: process.env.BASIC_AUTH_USERNAME,
					password: process.env.BASIC_AUTH_PASSWORD,
				},
      },
    },
  ],
}
```

## Querying:
```
{
  allNode {
		edges {
			node {
        data {
          title
          created
          body {
            value
          }
        }
      }
		}
	}
}
```
