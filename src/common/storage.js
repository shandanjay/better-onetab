import _ from 'lodash'
import {normalizeList} from '@/common/list'
import browser from 'webextension-polyfill'
import options from './options'

const get = key => browser.storage.local.get(key)
const set = obj => browser.storage.local.set(obj)

const isCrypto = ({url, title}) => url.includes('cryptowatch.') || url.includes('coinmarketcap.')|| url.includes('coinmarketcap.')|| title.includes('crypto')
const isTorrent = ({url}) => url.includes('yggtorrent.')
const isProjectBetterOneTab = ({url}) => url.includes('better-onetab')
const isShopping = ({url}) => url.includes('dealabs.com')
const isMusic = ({url}) => url.includes('soundcloud.com') || url.includes('deezer.com')
const isNext = ({url}) => url.includes('jira.com') || url.includes('aws.amazon.com') || url.includes('github.com/Next-Interactive/') || url.includes('atlassian.com') || url.includes('nextradiotv.com')
const isPhone = ({url}) => url.includes('xda-developers.com')
const isDev = ({url}) => url.includes('stackshare.io')

const getLists = () => get('lists')
  .then(({lists}) => {

    const listWithAutoTag = lists.map(e => {
      let shoppingCount = 0
      let musicCount = 0
      let nextCount = 0
      let isCryptoCount = 0
      let isTorrentCount = 0
      let betterOneTabCount = 0
      let isPhoneCount = 0
      let isDevCount = 0

      e.tabs.forEach(t => {
        if (isShopping(t)) {
          shoppingCount = shoppingCount + 1
        }
        if (isMusic(t)) {
          musicCount = musicCount + 1
        }
        if (isNext(t)) {
          nextCount = nextCount + 1
        }
        if (isProjectBetterOneTab(t)) {
          betterOneTabCount = betterOneTabCount + 1
        }
        if (isTorrent(t)) {
          isTorrentCount = isTorrentCount + 1
        }
        if (isCrypto(t)) {
          isCryptoCount = isCryptoCount + 1
        }
        if (isPhone(t)) {
          isPhoneCount = isPhoneCount + 1
        }
        if (isDev(t)) {
          isDevCount = isDevCount + 1
        }
      })

      if (nextCount >= 3) {
        if (!e.tags.includes('Next')) { e.tags.push('Next') }
      }
      if (musicCount >= 3) {
        if (!e.tags.includes('Music')) { e.tags.push('Music') }
      }
      if (shoppingCount >= 3) {
        if (!e.tags.includes('Shopping')) { e.tags.push('Shopping') }
      }
      if (isTorrentCount >= 3) {
        if (!e.tags.includes('DL')) { e.tags.push('DL') }
      }
      if (isCryptoCount >= 3) {
        if (!e.tags.includes('Crypto')) { e.tags.push('Crypto') }
      }
      if (betterOneTabCount >= 3) {
        if (!e.tags.includes('ProjectBetterOneTab')) { e.tags.push('ProjectBetterOneTab') }
      }
      if (isPhoneCount >= 3) {
        if (!e.tags.includes('Phone')) { e.tags.push('Phone') }
      }
      if (isDevCount >= 3) {
        if (!e.tags.includes('Dev')) { e.tags.push('Dev') }
      }

      if (e.tabs.length < 10) {
        if (!e.tags.includes('ToOrder')) { e.tags.push('ToOrder') }
      }


      if (e.tags.length === 0) { e.tags.push('Untagged') }


      return e
    })
    return listWithAutoTag || []
  })

const setLists = async lists => {
  if (!Array.isArray(lists)) throw new TypeError(lists)
  const handledLists = lists.filter(i => Array.isArray(i.tabs)).map(normalizeList)
  const {opts} = await get('opts')
  if (opts && opts.removeDuplicate) {
    handledLists.forEach(list => {
      list.tabs = _.unionBy(list.tabs, tab => tab.url)
    })
  }
  return set({lists: handledLists})
}

const getOptions = () => get('opts')
  .then(({opts}) => opts)

const setOptions = opts => set({
  opts: _.pick(opts, _.keys(options.getDefaultOptions())),
  optsUpdatedAt: Date.now(),
})

export default {
  getLists,
  setLists,
  getOptions,
  setOptions,
}
