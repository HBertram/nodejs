let fs = require("fs")

function save(path, content, callback=(err)=>{if(err)console.error(err)}) {
    let lastPath = path.substring(0, path.lastIndexOf("/"));
    fs.mkdir(lastPath, {recursive: true}, (err) => {
        if (err) return callback(err);
        fs.writeFile(path, content, function(err){
            if (err) return callback(err);
            return callback(null);
        });
    });
}


function toCamel(str) {
    return str.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
      return $1 + $2.toUpperCase();
    });
  }

let name = "task"

let upper = name.toUpperCase()

let camel = name[0].toUpperCase() + name.substr(1)

let template = 
`
const getTmplate${camel} = () => {
	return {
		
	}
}

const mutations = {
	[EDIT_${upper}] (state, payload) {
		console.debug("mutations: ${name}/EDIT_${upper} payload=", payload)
		let ${name} = state.${name}s.find((o) => o.id == payload.id)
		if (!${name}) {
			console.warn("mutations: 没有找到${name}", ${name})
		} else {
			let id = payload.id
			delete payload.id
			Object.assign(${name}, payload)
			payload.id = id
			console.debug("mutations: 找到${name}", ${name})
		}
	},
	[ADD_${upper}] (state, payload) {
		payload.id = this.uuid()
		let template = getTmplate${camel}()
		Object.assign(template, payload)
		console.debug("mutations: ${name}/ADD_${upper} payload=", template)
		state.${name}s.push(template)
	},
	[DELETE_${upper}] (state, { id }) {
		console.debug("mutations: ${name}/DELETE_${upper} id=", id)
		let ${name} = state.${name}s.find((o) => o.id == id)
		if (!!${name}) {
			state.${name}s.splice(state.${name}s.indexOf(${name}), 1)
		}
	}
}

const actions = {
	edit${camel}({ commit, state }, ${name}) {
		commit(EDIT_${upper}, ${name})
	},
	add${camel}({ commit, state }, ${name}) {
		if ( !${name}.task_id ) {
			console.error(\`actions: ${name}/add${camel} ${name}.task_id can not be \${${name}.task_id}\`)
			return
		}
		commit(ADD_${upper}, ${name})
	},
	delete${camel}({ commit, state }, ${name}) {
		if (!${name}.id) {
			console.error(\`actions: ${name}/add${camel} ${name}.id can not be \${${name}.id}\`)
			return
		}
		commit(DELETE_${upper}, ${name})
	}
}
`

console.log(template)