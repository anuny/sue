/*license*/
import {browser, type, timeout, dater, guid, is, array2Tree, tree2Array, log} from './helper'
import Fui from './mvvm'
import event from './event'
import router from './router'
import cookie from './cookie'
import http from './http'
import dom from './dom'

Fui.cookie = cookie
Fui.dom = dom
Fui.helper = {browser, type, timeout, dater, guid, is, array2Tree, tree2Array}
Fui.http = http
Fui.log = log
Fui.event = event
Fui.router = router
export default Fui
export {Fui}