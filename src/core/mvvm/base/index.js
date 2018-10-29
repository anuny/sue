import Base from './base'

const compiled = {}

const components = {}

function component(tag, template, options={}){
  if(!tag || !template) return Fui
  components[tag] = {template,options}
  return Fui
}

export{
	Base,
	compiled,
	components,
	component
}


