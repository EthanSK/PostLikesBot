import constants from "./constants"
export function delay(ms: number = constants.defaultDelayMillis) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function likesPageURL(userProfileId: string): string {
  return `https://www.facebook.com/${userProfileId}/allactivity?entry_point=www_top_menu_button&privacy_source=activity_log&log_filter=likedposts&category_key=likedposts`
}

export function fbPageURL(pageId: string): string {
  return `https://www.facebook.com/${pageId}`
}
