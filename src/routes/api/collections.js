import friendlyWords from 'friendly-words'

const workspaces = ['all', 'research', 'teaching', 'public', 'personal']

function friendlyName (type) {
  const index = Math.floor(Math.random() * Math.floor(friendlyWords[type].length));
  const word = friendlyWords[type][index].charAt(0).toUpperCase() + friendlyWords[type][index].slice(1)
  return word
}
function workspace () {
  const index = Math.floor(Math.random() * Math.floor(workspaces.length));
  return workspaces[index]
}
export async function get(req, res, next) {
  const collections = []
  for (let index = 0; index < 100; index++) {
    const tag = {
      name: `${friendlyName('predicates')} ${friendlyName('objects')} ${friendlyName('collections')}`,
      id: index,
      json: {
        workspace: workspace()
      }
    };
    collections.push(tag)
  }
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(collections));
}