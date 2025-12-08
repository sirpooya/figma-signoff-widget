const { widget } = figma
const { AutoLayout, Text, SVG, Image, Rectangle, useSyncedState, usePropertyMenu, useEffect, waitForTask } = widget

import * as bundledChecklistData from './checklist.json'

// External GitHub URL for checklist.json (same file used as bundled fallback)
const EXTERNAL_CHECKLIST_URL = 'https://raw.githubusercontent.com/sirpooya/figma-signoff-widget/refs/heads/main/src/checklist.json'

// Type definition for checklist structure
type ChecklistData = {
  headline: string
  sections: Array<{
    title: string
    items: string[]
  }>
}

// RTL Detection: Check if text contains Persian/Arabic characters
function isRTL(text: string): boolean {
  // Persian/Arabic Unicode ranges:
  // U+0600-U+06FF: Arabic block (includes Persian)
  // U+FB50-U+FDFF: Arabic Presentation Forms-A
  // U+FE70-U+FEFF: Arabic Presentation Forms-B
  const rtlRegex = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  return rtlRegex.test(text)
}

// Color variables
const colors = {
  "content-1": "#1F1F1F",
  "content-2": "#5C5C5C",
  "content-3": "#A2A2A2",
  "link": "#1672DD",
  "border-1": "#ECEDEF",
  "gray": "#BFC0C1",
  "error": "#EB3850",
  "info": "#3F69F2",
  "success": "#3DAA58",
  "success-tonal": "#E8F5EB",
  "warning": "#F57F17",
  "warning-tonal": "#FEF0E3",
  "on-warning-tonal": "#934C0E",
  "on-error": "#FFFFFF",
  "on-gray": "#FFFFFF",
  "on-info": "#FFFFFF",
  "on-success": "#FFFFFF",
  "on-warning": "#FFFFFF"
}

type Status = "review" | "ready-for-dev" | "live" | "live-app" | "live-web" | "archived"

const statusConfig: { [key in Status]: { label: string; color: string; textColor: string } } = {
  "review": { label: "In-Review", color: colors.warning, textColor: colors["on-warning"] },
  "ready-for-dev": { label: "Ready for Dev", color: colors.success, textColor: colors["on-success"] },
  "live": { label: "Live", color: colors.info, textColor: colors["on-info"] },
  "live-app": { label: "Live - App", color: colors.info, textColor: colors["on-info"] },
  "live-web": { label: "Live - Web", color: colors.info, textColor: colors["on-info"] },
  "archived": { label: "Archived", color: colors.error, textColor: colors["on-error"] }
}

// SVG constants
const archivedSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M13.963 2.804c1.040 0 1.952 0.7 2.222 1.706 0.006 0.022 0.011 0.045 0.015 0.067l0.298 1.461h3.36c0.615 0 1.115 0.5 1.115 1.115s-0.5 1.115-1.115 1.115h-0.748v8.889c0 0.027-0.001 0.055-0.003 0.082-0.163 2.229-2.019 3.956-4.256 3.956h-5.699c-2.236 0-4.094-1.727-4.257-3.958-0.002-0.027-0.002-0.054-0.002-0.080l-0.002-8.889h-0.75c-0.615 0-1.115-0.5-1.115-1.115s0.5-1.115 1.115-1.115h3.365l0.293-1.46 0.017-0.069c0.271-1.009 1.186-1.708 2.228-1.706h3.919zM7.121 17.103c0.091 1.053 0.972 1.865 2.031 1.865h5.699c1.060-0 1.941-0.812 2.031-1.865v-8.834h-9.76v8.834zM13.029 10.838c0.435-0.435 1.14-0.435 1.575 0s0.435 1.142 0 1.577l-1.030 1.028 1.030 1.030c0.435 0.435 0.435 1.14 0 1.575s-1.14 0.435-1.575 0l-1.030-1.030-1.028 1.030c-0.435 0.435-1.142 0.435-1.577 0s-0.434-1.14 0-1.575l1.028-1.030-1.028-1.028c-0.435-0.435-0.435-1.142 0-1.577s1.142-0.435 1.577 0l1.028 1.028 1.030-1.028zM10.041 5.034c-0.033 0-0.061 0.021-0.070 0.050l-0.191 0.954h4.443l-0.194-0.958c-0.010-0.027-0.035-0.047-0.065-0.047h-3.922z"></path>
</svg>`

const inReviewSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M11.529 4.967c3.551 0 6.429 2.879 6.429 6.43-0 1.379-0.436 2.655-1.175 3.701l1.743 1.739c0.502 0.502 0.503 1.316 0.002 1.818s-1.316 0.503-1.818 0.002l-1.798-1.795c-0.982 0.609-2.141 0.962-3.382 0.963-3.551-0-6.43-2.878-6.43-6.429s2.879-6.43 6.43-6.43zM11.529 7.538c-2.131 0-3.859 1.728-3.859 3.859s1.728 3.857 3.859 3.857c2.13-0 3.857-1.727 3.857-3.857s-1.726-3.858-3.857-3.859z"></path>
</svg>`

const liveAppSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M14.333 3.485c2.125 0 3.686 1.849 3.686 3.921v9.817c-0 2.071-1.562 3.921-3.686 3.921h-5.143c-2.125 0-3.686-1.85-3.686-3.921v-9.817c0-2.071 1.562-3.921 3.686-3.921h5.143zM9.19 5.715c-0.715 0-1.456 0.664-1.456 1.691v9.817c0 1.027 0.741 1.691 1.456 1.691h5.143c0.715 0 1.456-0.664 1.457-1.691v-9.817c0-1.027-0.741-1.691-1.457-1.691h-5.143zM13.345 14.921c0.615 0 1.115 0.5 1.115 1.115s-0.5 1.113-1.115 1.113h-2.69c-0.615-0-1.115-0.498-1.115-1.113s0.5-1.115 1.115-1.115h2.69z"></path>
</svg>`

const liveWebSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M11.999 3.592c4.644 0 8.409 3.764 8.409 8.407s-3.765 8.409-8.409 8.409c-4.643-0.001-8.407-3.766-8.407-8.409s3.764-8.407 8.407-8.407zM10.292 13.029c0.084 1.52 0.346 2.851 0.713 3.829 0.225 0.6 0.469 1.015 0.686 1.261 0.106 0.119 0.19 0.18 0.243 0.209 0.025 0.014 0.043 0.019 0.052 0.022 0.007 0.002 0.011 0.002 0.013 0.002s0.007 0 0.015-0.002c0.009-0.003 0.026-0.009 0.050-0.022 0.053-0.029 0.137-0.090 0.243-0.209 0.218-0.246 0.461-0.661 0.686-1.261 0.367-0.978 0.629-2.309 0.713-3.829h-3.415zM15.768 13.029c-0.086 1.73-0.385 3.314-0.849 4.55-0.010 0.025-0.022 0.050-0.032 0.075 1.764-0.902 3.050-2.602 3.38-4.626h-2.499zM5.733 13.029c0.33 2.022 1.615 3.721 3.377 4.624-0.009-0.025-0.021-0.049-0.030-0.074-0.464-1.236-0.761-2.82-0.847-4.55h-2.499zM9.11 6.342c-1.763 0.903-3.049 2.605-3.378 4.629h2.501c0.086-1.731 0.383-3.315 0.847-4.552 0.010-0.026 0.020-0.052 0.030-0.077zM11.986 5.651c-0.009 0.002-0.027 0.008-0.052 0.022-0.053 0.029-0.137 0.090-0.243 0.209-0.218 0.246-0.462 0.661-0.686 1.261-0.366 0.978-0.629 2.308-0.713 3.829h3.415c-0.084-1.52-0.347-2.851-0.713-3.829-0.225-0.6-0.469-1.015-0.686-1.261-0.106-0.12-0.19-0.18-0.243-0.209-0.025-0.013-0.041-0.019-0.050-0.022s-0.013-0.003-0.015-0.003c-0.002 0-0.006 0.001-0.013 0.003zM14.919 6.419c0.464 1.237 0.763 2.821 0.849 4.552h2.499c-0.33-2.025-1.616-3.726-3.38-4.629 0.010 0.026 0.022 0.051 0.032 0.077z"></path>
</svg>`

const liveSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M5.978 5.96c0.435-0.435 1.141-0.434 1.575 0.002s0.435 1.14 0 1.575c-1.142 1.141-1.846 2.715-1.847 4.455 0 1.746 0.71 3.325 1.86 4.467 0.436 0.434 0.438 1.139 0.005 1.575s-1.139 0.44-1.575 0.007c-1.554-1.543-2.519-3.684-2.52-6.049 0-2.355 0.958-4.49 2.501-6.032zM16.456 5.96c0.435-0.434 1.14-0.435 1.575 0 1.599 1.599 2.496 3.77 2.493 6.032l-0.012 0.44c-0.112 2.189-1.050 4.162-2.506 5.608-0.437 0.433-1.143 0.43-1.577-0.007s-0.43-1.142 0.007-1.575c1.149-1.141 1.86-2.72 1.86-4.467v-0.003c0.002-1.669-0.66-3.271-1.84-4.451-0.435-0.435-0.435-1.142 0-1.577zM12.001 9.027c1.674 0 3.030 1.358 3.030 3.032s-1.356 3.030-3.030 3.030c-1.674 0-3.032-1.356-3.032-3.030s1.358-3.032 3.032-3.032z"></path>
</svg>`

const readyForDevSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M13.001 6.506c0.195-0.583 0.824-0.899 1.408-0.705s0.899 0.824 0.705 1.408l-3.429 10.286c-0.195 0.584-0.824 0.899-1.408 0.705s-0.899-0.824-0.705-1.408l3.429-10.286zM4.451 7.212c0.384-0.48 1.087-0.558 1.567-0.174s0.558 1.086 0.174 1.567l-2.873 3.589 2.873 3.589c0.384 0.48 0.306 1.182-0.174 1.567s-1.183 0.306-1.567-0.174l-3.429-4.286c-0.325-0.407-0.325-0.986 0-1.393l3.429-4.286zM17.981 7.038c0.48-0.384 1.182-0.306 1.567 0.174l3.429 4.286c0.325 0.407 0.325 0.986 0 1.393l-3.429 4.286c-0.384 0.48-1.086 0.558-1.567 0.174s-0.558-1.086-0.174-1.567l2.871-3.589-2.871-3.589c-0.384-0.481-0.306-1.183 0.174-1.567z"></path>
</svg>`

const signoffSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M19.157 19.913c0.497 0 0.9 0.402 0.9 0.899s-0.403 0.9-0.9 0.9h-8.609c-0.497 0-0.9-0.404-0.9-0.9s0.403-0.899 0.9-0.899h8.609zM20.408 2.703c0.227-0.019 0.455 0.049 0.636 0.192 0.206 0.164 0.33 0.411 0.339 0.675 0.049 1.499-0.198 5.59-4.011 8.38-0.229 0.167-0.524 0.216-0.795 0.134l-2.213-0.676-0.186 2.256c-0.032 0.38-0.299 0.699-0.668 0.796-3.22 0.849-5.823 0.631-7.306 0.356-0.537 1.325-1.176 3.122-1.722 5.849-0.097 0.487-0.572 0.804-1.060 0.706s-0.803-0.571-0.706-1.059c0.678-3.392 1.505-5.44 2.114-6.886 3.057-7.248 10.861-9.804 15.478-10.709l0.098-0.014zM19.544 4.725c-4.223 0.99-9.868 3.259-12.576 8.394 1.229 0.182 3.14 0.272 5.47-0.25l0.226-2.72 0.014-0.101c0.046-0.231 0.181-0.437 0.378-0.57 0.225-0.153 0.507-0.195 0.768-0.116l2.834 0.865c2.136-1.741 2.741-3.999 2.888-5.502z"></path>
</svg>`

const wipSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M11.39 4.353c1.232-1.232 3.231-1.232 4.463 0l3.85 3.849c0.591 0.591 0.922 1.394 0.922 2.23s-0.331 1.642-0.922 2.233c-0.69 0.69-1.621 0.992-2.523 0.909l-0.38 3.049c-0.13 1.041-0.905 1.888-1.93 2.111l-8.441 1.835c-0.677 0.147-1.375-0.002-1.934-0.388-0.138-0.054-0.267-0.135-0.378-0.246s-0.193-0.241-0.248-0.378c-0.386-0.558-0.532-1.256-0.385-1.932l1.835-8.439c0.223-1.026 1.071-1.8 2.113-1.93l3.047-0.382c-0.082-0.901 0.221-1.83 0.911-2.52zM7.709 9.466c-0.104 0.013-0.189 0.091-0.211 0.193l-1.478 6.797 2.181-2.181c-0.008-0.067-0.012-0.135-0.012-0.204-0-0.991 0.803-1.795 1.793-1.796l0.177 0.010c0.353 0.035 0.688 0.172 0.963 0.397l0.131 0.119 0.12 0.132c0.262 0.32 0.406 0.723 0.405 1.14-0.002 0.99-0.804 1.791-1.795 1.791-0.070 0-0.138-0.006-0.206-0.013l-2.185 2.185 6.804-1.478c0.102-0.023 0.179-0.106 0.192-0.209l0.48-3.852-3.511-3.511-3.85 0.482zM14.276 5.93c-0.362-0.362-0.947-0.362-1.309 0s-0.363 0.947-0.002 1.309l3.851 3.85c0.362 0.361 0.949 0.36 1.311-0.002 0.173-0.174 0.271-0.409 0.271-0.655s-0.098-0.481-0.271-0.655l-3.85-3.849z"></path>
</svg>`

const refreshSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M21.009 13.101c0.057 0 0.113 0.006 0.169 0.017 0.080 0.016 0.156 0.043 0.227 0.078 0.007 0.004 0.015 0.007 0.023 0.011 0.209 0.112 0.369 0.304 0.438 0.535 0.025 0.085 0.038 0.172 0.038 0.26v4.002c-0 0.497-0.403 0.899-0.899 0.899s-0.9-0.403-0.9-0.899v-1.829l-2.318 2.318c-1.448 1.447-3.379 2.301-5.414 2.401l-0.408 0.010c-3.366-0-6.394-2.049-7.645-5.175l-0.157-0.393c-0.185-0.461 0.040-0.985 0.501-1.17s0.986 0.040 1.171 0.501l0.156 0.392 0.001 0.001c0.977 2.442 3.342 4.044 5.973 4.044 1.706 0 3.343-0.678 4.55-1.885l2.317-2.317h-1.828c-0.497 0-0.9-0.404-0.9-0.9s0.403-0.9 0.9-0.9h4.007zM12.037 3.097c3.366 0 6.394 2.050 7.644 5.176l0.156 0.392c0.184 0.461-0.040 0.986-0.501 1.171s-0.985-0.040-1.17-0.501l-0.157-0.393c-0.977-2.442-3.342-4.044-5.973-4.044-1.706-0-3.343 0.677-4.55 1.884l-2.318 2.318h1.829c0.497 0 0.899 0.403 0.899 0.9s-0.403 0.899-0.899 0.899h-4.002c-0.049 0-0.096-0.005-0.143-0.013-0.011-0.002-0.023-0.004-0.034-0.006-0.045-0.009-0.089-0.022-0.131-0.037-0.013-0.005-0.026-0.009-0.038-0.014-0.010-0.004-0.019-0.009-0.028-0.014-0.095-0.043-0.185-0.103-0.263-0.181-0.034-0.034-0.064-0.071-0.091-0.108-0.041-0.057-0.076-0.119-0.103-0.184-0.027-0.064-0.045-0.131-0.056-0.198-0.008-0.047-0.014-0.095-0.014-0.144v-4.002c0-0.497 0.403-0.9 0.9-0.9s0.9 0.403 0.9 0.9v1.828l2.317-2.317c1.544-1.544 3.639-2.412 5.823-2.412z"></path>
</svg>`

const defaultAvatarSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="16" height="16" rx="8" fill="#ECEDEF"/>
<ellipse cx="8" cy="11.5" rx="5" ry="3" fill="white"/>
<circle cx="8" cy="5" r="2.5" fill="white"/>
</svg>`

const featherMiniSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M19.158 20.296c0.283 0.001 0.514 0.232 0.514 0.516s-0.231 0.513-0.514 0.514h-8.61c-0.284 0-0.514-0.23-0.514-0.514s0.23-0.516 0.514-0.516h8.61zM20.496 3.085c0.111 0.003 0.22 0.042 0.308 0.112 0.117 0.094 0.189 0.235 0.194 0.385 0.048 1.451-0.195 5.378-3.854 8.056-0.13 0.095-0.299 0.124-0.454 0.077l-2.672-0.815-0.224 2.732c-0.018 0.217-0.172 0.398-0.382 0.454-3.391 0.893-6.076 0.578-7.441 0.288-0.565 1.366-1.273 3.248-1.867 6.214-0.056 0.278-0.326 0.459-0.604 0.404s-0.459-0.326-0.403-0.604c0.671-3.357 1.487-5.38 2.091-6.812 2.976-7.055 10.598-9.579 15.198-10.48l0.11-0.010zM19.967 4.233c-4.416 0.957-10.787 3.335-13.577 9.174 1.253 0.242 3.539 0.461 6.41-0.233l0.248-2.995 0.022-0.114c0.035-0.109 0.106-0.204 0.203-0.27 0.129-0.087 0.29-0.112 0.439-0.067l3.027 0.924c2.651-2.058 3.167-4.866 3.229-6.42z"></path>
</svg>`

function getStatusIconSrc(status: Status, color: string): string {
  const svgMap: { [key in Status]: string } = {
    "review": inReviewSvg,
    "ready-for-dev": readyForDevSvg,
    "live": liveSvg,
    "live-app": liveAppSvg,
    "live-web": liveWebSvg,
    "archived": archivedSvg
  }
  
  const svg = svgMap[status]
  // Replace width/height to 14x14 and add fill color to path
  return svg
    .replace(/width="24" height="24"/, 'width="14" height="14"')
    .replace(/<path d="/, `<path fill="${color}" d="`)
}

const getSignoffIconSrc = (color: string) => {
  return signoffSvg.replace(/<path d="/, `<path fill="${color}" d="`)
}

const getWipIconSrc = (color: string) => {
  return wipSvg.replace(/<path d="/, `<path fill="${color}" d="`)
}

const getRefreshIconSrc = (color: string) => {
  return refreshSvg.replace(/<path d="/, `<path fill="${color}" d="`)
}

const getFeatherMiniIconSrc = (color: string) => {
  return featherMiniSvg
    .replace(/width="24" height="24"/, 'width="12" height="12"')
    .replace(/<path d="/, `<path fill="${color}" d="`)
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

function formatDateTime(date: Date, options?: { includeYear?: boolean; separator?: string; padDay?: boolean }): string {
  const { includeYear = true, separator = ' - ', padDay = true } = options || {}
  const year = date.getFullYear()
  const month = monthNames[date.getMonth()]
  const day = padDay ? String(date.getDate()).padStart(2, '0') : date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  if (includeYear) {
    return `${year} ${month} ${day}${separator}${hours}:${minutes}`
  }
  return `${month} ${day}${separator}${hours}:${minutes}`
}

function getCurrentDateTime(): string {
  return formatDateTime(new Date())
}

function DateRow({ label, date, onRefresh, hasBorderBottom, photoUrl, userName, showRefreshButton = true, isSignedOff = false, onSignOff }) {
  const isSignoffRow = photoUrl !== undefined && userName !== undefined
  return (
    <AutoLayout
      name={isSignoffRow ? "signoff-row" : "revision-row"}
      direction="horizontal"
      verticalAlignItems="center"
      spacing={12}
      padding={16}
      width="fill-parent"
      stroke={hasBorderBottom ? {
        type: "solid",
        color: colors["border-1"]
      } : undefined}
      strokeWidth={hasBorderBottom ? 1 : undefined}
    >
      <AutoLayout
        name="time-wrapper"
        direction="vertical"
        verticalAlignItems="start"
        spacing={6}
        width="fill-parent"
      >
        <Text
          name="label"
          fontSize={14}
          fill={colors["content-1"]}
          fontWeight="medium"
          width="fill-parent"
        >
          {label}
        </Text>
        {isSignoffRow ? (
          <AutoLayout
            name="subtitle-wrapper"
            direction="horizontal"
            verticalAlignItems="center"
            spacing={6}
            padding={{ top: 0, bottom: 0, left: 0, right: 0 }}
            width="fill-parent"
          >
            {photoUrl ? (
              <Image name="avatar" cornerRadius={12} width={16} height={16} src={String(photoUrl)} />
            ) : (
              <SVG name="avatar" src={defaultAvatarSvg} width={16} height={16} />
            )}
            <Text
              name="name"
              fontSize={14}
              fontWeight="normal"
              fill={colors["content-2"]}
            >
              {userName}
            </Text>
            {isSignedOff && (
              <>
                <Text
                  fontSize={14}
                  fill={colors["content-3"]}
                  fontWeight="normal"
                >
                  –
                </Text>
                <Text
                  name="timestamp"
                  fontSize={14}
                  fill={colors["content-3"]}
                  fontWeight="normal"
                >
                  {date}
                </Text>
              </>
            )}
          </AutoLayout>
        ) : (
          <Text
            name="timestamp"
            fontSize={14}
            fill={colors["content-3"]}
            fontWeight="normal"
            width="fill-parent"
          >
            {date}
          </Text>
        )}
      </AutoLayout>
      {isSignoffRow && !isSignedOff && onSignOff && (
        <AutoLayout
          name="signoff-button"
          direction="horizontal"
          verticalAlignItems="center"
          horizontalAlignItems="center"
          spacing={6}
          padding={0}
          onClick={onSignOff}
          hoverStyle={{ opacity: 0.8 }}
        >
          <SVG
            src={getSignoffIconSrc(colors.link)}
            width={24}
            height={24}
          />
          <Text
            fontSize={14}
            fill={colors.link}
            fontWeight="semi-bold"
            fontFamily="Inter"
          >
            Sign Off
          </Text>
        </AutoLayout>
      )}
      {showRefreshButton && (
        <SVG
          name="refresh-button"
          src={getRefreshIconSrc(colors.link)}
          onClick={onRefresh}
        />
      )}
    </AutoLayout>
  )
}

function ApprovalRow({ role, approved, assignee, photoUrl, timestamp, onToggle, hasBorderBottom }) {
  const config = approved 
    ? { label: "Approved", color: colors.success, textColor: colors["on-success"] }
    : { label: "In-Review", color: colors["warning-tonal"], textColor: colors["on-warning-tonal"] }
  
  return (
    <AutoLayout
      name="approval-row"
      direction="horizontal"
      verticalAlignItems="center"
      spacing={12}
      padding={16}
      width="fill-parent"
      stroke={hasBorderBottom ? {
        type: "solid",
        color: colors["border-1"]
      } : undefined}
      strokeWidth={hasBorderBottom ? 1 : undefined}
      strokeAlign="center"
    >
      <AutoLayout
        name="approval-wrapper"
        direction="vertical"
        verticalAlignItems="start"
        spacing={6}
        width="fill-parent"
      >
        <Text
          name="role"
          fontSize={14}
          fill={colors["content-1"]}
          fontWeight="medium"
          width="fill-parent"
        >
          {role}
        </Text>
        <AutoLayout
          name="assignee-wrapper"
          direction="horizontal"
          verticalAlignItems="center"
          spacing={6}
          padding={0}
          width="fill-parent"
        >
          {photoUrl ? (
            <Image
              name="avatar"
              cornerRadius={12}
              width={16}
              height={16}
              src={photoUrl}
            />
          ) : (
            <SVG
              name="avatar"
              src={defaultAvatarSvg}
              width={16}
              height={16}
            />
          )}
          <Text
            name="assignee"
            fontSize={14}
            fill={colors["content-2"]}
            fontWeight="normal"
          >
            {assignee || "Assignee"}
          </Text>
          {approved && timestamp && (
            <>
              <Text
                fontSize={14}
                fill={colors["content-3"]}
                fontWeight="normal"
              >
                –
              </Text>
              <Text
                fontSize={14}
                fill={colors["content-3"]}
                fontWeight="normal"
              >
                {timestamp}
              </Text>
            </>
          )}
        </AutoLayout>
      </AutoLayout>
      <AutoLayout
        name="status-badge"
        direction="horizontal"
        verticalAlignItems="center"
        horizontalAlignItems="center"
        padding={{ left: 12, right: 12, top: 6, bottom: 6 }}
        fill={config.color}
        cornerRadius={8}
        spacing={6}
        onClick={onToggle}
        hoverStyle={{ opacity: 0.8 }}
      >
        <Text
          fontFamily="Inter"
          fontSize={12}
          fill={config.textColor}
          fontWeight="medium"
          letterSpacing={2}
        >
          {config.label.toUpperCase()}
        </Text>
      </AutoLayout>
    </AutoLayout>
  )
}

function CheckboxItem({ label, checked, onToggle, direction = 'rtl' }: { label: string; checked: boolean; onToggle: () => void; direction?: 'rtl' | 'ltr' }) {
  const isRTLDirection = direction === 'rtl'
  const textAlign = isRTLDirection ? 'right' : 'left'
  const fontFamily = isRTLDirection ? 'Vazirmatn' : 'Inter'
  
  // For RTL: text first, then checkbox (current layout)
  // For LTR: checkbox first, then text (reversed)
  const checkboxElement = (
    <AutoLayout
      name="checkbox"
      width={24}
      height={24}
      verticalAlignItems="center"
      horizontalAlignItems="center"
      fill={checked ? colors.success : "#FFFFFF"}
      cornerRadius={96}
      stroke={{
        type: 'solid',
        color: checked ? colors.success : colors["border-1"]
      }}
      strokeWidth={2}
    >
      {checked && (
        <Text
          fontSize={14}
          fill={colors["on-success"]}
        >
          ✓
        </Text>
      )}
    </AutoLayout>
  )
  
  const textElement = (
    <Text
      fontSize={14}
      fill="#000000"
      fontFamily={fontFamily}
      horizontalAlignText={textAlign}
      width="fill-parent"
      textDecoration={checked ? "strikethrough" : "none"}
    >
      {label}
    </Text>
  )
  
  return (
    <AutoLayout
      name="checkbox-row"
      direction="horizontal"
      verticalAlignItems="center"
      spacing={8}
      padding={{ top: 6, bottom: 6, left: 0, right: 0 }}
      width="fill-parent"
      fill={checked ? colors["success-tonal"] : undefined}
      onClick={onToggle}
      hoverStyle={{ opacity: 0.8 }}
    >
      {isRTLDirection ? (
        <>
          {textElement}
          {checkboxElement}
        </>
      ) : (
        <>
          {checkboxElement}
          {textElement}
        </>
      )}
    </AutoLayout>
  )
}

function TitleSection({ status, photoUrl, userName, designerSignedOff }: { status: Status; photoUrl: string | null; userName: string; designerSignedOff: boolean }) {
  const config = designerSignedOff ? statusConfig[status] : { label: "In-Progress", color: colors.gray, textColor: colors["on-gray"] }
  const iconSrc = designerSignedOff 
    ? getStatusIconSrc(status, config.textColor)
    : getWipIconSrc(config.textColor).replace(/width="24" height="24"/, 'width="14" height="14"')
  
  return (
    <AutoLayout
      name="header-section"
      direction="horizontal"
      verticalAlignItems="center"
      horizontalAlignItems="start"
      spacing={12}
      padding={{ top: 0, bottom: 0, left: 0, right: 0 }}
      width="fill-parent"
    >
      <AutoLayout
        name="title-wrapper"
        direction="vertical"
        verticalAlignItems="start"
        spacing={8}
        padding={{ top: 0, bottom: 0, left: 0, right: 0 }}
        width="fill-parent"
      >
        <Text
          name="title"
          fontSize={20}
          fill={colors["content-1"]}
          fontWeight="bold"
          width="fill-parent"
        >
          Design Status
        </Text>
      </AutoLayout>
      <AutoLayout
        name="status-badge"
        direction="horizontal"
        verticalAlignItems="center"
        horizontalAlignItems="center"
        padding={{ left: 12, right: 12, top: 6, bottom: 6 }}
        fill={config.color}
        cornerRadius={96}
        spacing={6}
      >
        <SVG
          src={iconSrc}
          width={14}
          height={14}
        />
        <Text
          fontFamily="Inter"
          fontSize={12}
          fill={config.textColor}
          fontWeight="medium"
          letterSpacing={2}
        >
          {config.label.toUpperCase()}
        </Text>
      </AutoLayout>
    </AutoLayout>
  )
}

function CheckboxWidget() {
  const [status, setStatus] = useSyncedState<Status>('status', 'review')
  const [finalizationDate, setFinalizationDate] = useSyncedState('finalizationDate', getCurrentDateTime())
  const [lastRevision, setLastRevision] = useSyncedState('lastRevision', getCurrentDateTime())
  const [designerSignedOff, setDesignerSignedOff] = useSyncedState('designerSignedOff', false)
  const [pmApproved, setPmApproved] = useSyncedState('pmApproved', false)
  const [pmAssignee, setPmAssignee] = useSyncedState<string | null>('pmAssignee', null)
  const [pmPhotoUrl, setPmPhotoUrl] = useSyncedState<string | null>('pmPhotoUrl', null)
  const [pmTimestamp, setPmTimestamp] = useSyncedState<string | null>('pmTimestamp', null)
  const [designLeadApproved, setDesignLeadApproved] = useSyncedState('designLeadApproved', false)
  const [designLeadAssignee, setDesignLeadAssignee] = useSyncedState<string | null>('designLeadAssignee', null)
  const [designLeadPhotoUrl, setDesignLeadPhotoUrl] = useSyncedState<string | null>('designLeadPhotoUrl', null)
  const [designLeadTimestamp, setDesignLeadTimestamp] = useSyncedState<string | null>('designLeadTimestamp', null)
  const [dsmApproved, setDsmApproved] = useSyncedState('dsmApproved', false)
  const [dsmAssignee, setDsmAssignee] = useSyncedState<string | null>('dsmAssignee', null)
  const [dsmPhotoUrl, setDsmPhotoUrl] = useSyncedState<string | null>('dsmPhotoUrl', null)
  const [dsmTimestamp, setDsmTimestamp] = useSyncedState<string | null>('dsmTimestamp', null)
  const [showChecklist, setShowChecklist] = useSyncedState('showChecklist', true)
  // Current user info for avatar display
  const [currentUserName, setCurrentUserName] = useSyncedState<string>('currentUserName', "")
  const [currentUserPhotoUrl, setCurrentUserPhotoUrl] = useSyncedState<string | null>('currentUserPhotoUrl', null)
  
  // Store checklist data structure in syncedState - start as null, will be set after fetch attempt
  const [checklistData, setChecklistData] = useSyncedState<ChecklistData | null>(
    'checklistData',
    null
  )
  
  // Track if we've attempted to fetch the external checklist
  const [hasFetchedExternal, setHasFetchedExternal] = useSyncedState<boolean>(
    'hasFetchedExternal',
    false
  )
  
  // Initialize checklist items state from JSON
  const [checklistItems, setChecklistItems] = useSyncedState<{ [key: string]: boolean }>(
    'checklistItems',
    {}
  )
  
  // Direction will be computed directly from checklistData.headline in render logic

  // Try to fetch external checklist from GitHub URL first, fallback to default if it fails
  useEffect(() => {
    // Only fetch if we haven't tried yet
    if (hasFetchedExternal) {
      return
    }
    
    // Set flag immediately to prevent infinite loop
    setHasFetchedExternal(true)
    
    console.log('[CHECKLIST] Fetching:', EXTERNAL_CHECKLIST_URL)
    
    let fetchPromise: Promise<Response>
    try {
      fetchPromise = fetch(EXTERNAL_CHECKLIST_URL)
    } catch (err) {
      console.error('[CHECKLIST] ❌ Fetch error:', err)
      fetchPromise = Promise.reject(err)
    }
    
    fetchPromise = fetchPromise.catch(err => {
      throw err
    })
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Fetch timeout after 5 seconds'))
      }, 5000)
    })
    
    // Track if we've handled the response
    let handled = false
    
    // Set up a separate fallback timeout that will definitely fire after 6 seconds
    const fallbackTimeoutId = setTimeout(() => {
      if (!handled && !checklistData) {
        console.error('[CHECKLIST] ⏰ Timeout - using fallback')
        handled = true
        const fallbackData = (bundledChecklistData as any).default || bundledChecklistData as ChecklistData
        const data = fallbackData.default || fallbackData
        if (data && data.sections) {
          setChecklistData(data as ChecklistData)
          const newItems = data.sections.reduce((acc: { [key: string]: boolean }, section: any, sectionIndex: number) => {
            section.items.forEach((_: any, itemIndex: number) => {
              const key = `${sectionIndex}-${itemIndex}`
              acc[key] = false
            })
            return acc
          }, {})
          setChecklistItems(newItems)
        }
      }
    }, 6000) // 6 seconds - slightly longer than the Promise.race timeout
    
    // CRITICAL: Use waitForTask to keep widget alive during async fetch
    waitForTask(
      Promise.race([fetchPromise, timeoutPromise])
      .then(response => {
        if (handled) {
          return
        }
        clearTimeout(fallbackTimeoutId) // Clear the fallback timeout
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data: any) => {
        // Raw GitHub URL returns JSON directly
        return data as ChecklistData
      })
      .then((data: ChecklistData) => {
        // Validate the structure
        if (data && data.headline && data.sections && Array.isArray(data.sections)) {
          console.log('[CHECKLIST] ✅ Success (status: 200)')
          setChecklistData(data)
          // Initialize checklist items for the external structure
          const newItems = data.sections.reduce((acc, section, sectionIndex) => {
            section.items.forEach((_, itemIndex) => {
              const key = `${sectionIndex}-${itemIndex}`
              acc[key] = false
            })
            return acc
          }, {} as { [key: string]: boolean })
          setChecklistItems(newItems)
          // figma.notify('Checklist is up to date', { timeout: 2000 })
          handled = true // Only set handled after successful completion
        } else {
          throw new Error('Invalid checklist structure')
        }
      })
      .catch(error => {
        if (handled) {
          return
        }
        handled = true
        clearTimeout(fallbackTimeoutId) // Clear the fallback timeout
        console.error('[CHECKLIST] ❌ Error:', error?.name, '-', error?.message)
        
        // Check for specific error types and show appropriate notification
        // if (error?.name === 'TypeError' && error?.message?.includes('Failed to fetch')) {
        //   figma.notify('Using fallback checklist (Network blocked).', { timeout: 3000 })
        // } else if (error?.message?.includes('timeout')) {
        //   figma.notify('Using fallback checklist (Request timeout).', { timeout: 3000 })
        // } else {
        //   figma.notify('Using fallback checklist (Fetch failed).', { timeout: 3000 })
        // }
        
        // Fallback to bundled fallback checklist - ALWAYS set this
        console.log('[CHECKLIST] Using fallback checklist')
        const fallbackData = bundledChecklistData as any
        const data = fallbackData.default || fallbackData
        
        // Set the checklist data - don't validate too strictly, just set it
        if (data && data.sections) {
          setChecklistData(data as ChecklistData)
          // Initialize checklist items for the default structure
          const newItems = data.sections.reduce((acc: { [key: string]: boolean }, section: any, sectionIndex: number) => {
            section.items.forEach((_: any, itemIndex: number) => {
              const key = `${sectionIndex}-${itemIndex}`
              acc[key] = false
            })
            return acc
          }, {})
          setChecklistItems(newItems)
        } else {
          figma.notify('Failed to load checklist', { timeout: 3000, error: true })
        }
      })
      .catch(err => {
        console.error('[CHECKLIST] Outer catch:', err)
        // Even if there's an outer error, set fallback
        if (!checklistData) {
          const fallbackData = (bundledChecklistData as any).default || bundledChecklistData as ChecklistData
          const data = fallbackData.default || fallbackData
          if (data && data.sections) {
            setChecklistData(data as ChecklistData)
            const newItems = data.sections.reduce((acc: { [key: string]: boolean }, section: any, sectionIndex: number) => {
              section.items.forEach((_: any, itemIndex: number) => {
                const key = `${sectionIndex}-${itemIndex}`
                acc[key] = false
              })
              return acc
            }, {})
            setChecklistItems(newItems)
          }
        }
      })
    ) // End of waitForTask - keeps widget alive during async fetch
  }, [hasFetchedExternal])

  // Capture current user info when widget loads (EXACTLY matching WidgetUserBadge pattern)
  useEffect(() => {
    if (!currentUserName) {
      if (figma.currentUser) {
        setCurrentUserName(figma.currentUser.name)
        setCurrentUserPhotoUrl(figma.currentUser.photoUrl)
      } else {
        figma.notify("Please login to Figma", { timeout: 3000 })
      }
    }
  })

  // Capture usernames and avatars when items are approved
  useEffect(() => {
    if (pmApproved && !pmAssignee) {
      if (figma.currentUser) {
        setPmAssignee(figma.currentUser.name)
        setPmPhotoUrl(figma.currentUser.photoUrl)
      }
    }
  })
  
  useEffect(() => {
    if (designLeadApproved && !designLeadAssignee) {
      if (figma.currentUser) {
        setDesignLeadAssignee(figma.currentUser.name)
        setDesignLeadPhotoUrl(figma.currentUser.photoUrl)
      }
    }
  })
  
  useEffect(() => {
    if (dsmApproved && !dsmAssignee) {
      if (figma.currentUser) {
        setDsmAssignee(figma.currentUser.name)
        setDsmPhotoUrl(figma.currentUser.photoUrl)
      }
    }
  })

  usePropertyMenu(
    [
      ...(designerSignedOff ? [] : [
        {
          itemType: "action",
          tooltip: "Sign Off",
          propertyName: "signOff",
          icon: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
<path fill="white" d="M19.157 19.913c0.497 0 0.9 0.402 0.9 0.899s-0.403 0.9-0.9 0.9h-8.609c-0.497 0-0.9-0.404-0.9-0.9s0.403-0.899 0.9-0.899h8.609zM20.408 2.703c0.227-0.019 0.455 0.049 0.636 0.192 0.206 0.164 0.33 0.411 0.339 0.675 0.049 1.499-0.198 5.59-4.011 8.38-0.229 0.167-0.524 0.216-0.795 0.134l-2.213-0.676-0.186 2.256c-0.032 0.38-0.299 0.699-0.668 0.796-3.22 0.849-5.823 0.631-7.306 0.356-0.537 1.325-1.176 3.122-1.722 5.849-0.097 0.487-0.572 0.804-1.060 0.706s-0.803-0.571-0.706-1.059c0.678-3.392 1.505-5.44 2.114-6.886 3.057-7.248 10.861-9.804 15.478-10.709l0.098-0.014zM19.544 4.725c-4.223 0.99-9.868 3.259-12.576 8.394 1.229 0.182 3.14 0.272 5.47-0.25l0.226-2.72 0.014-0.101c0.046-0.231 0.181-0.437 0.378-0.57 0.225-0.153 0.507-0.195 0.768-0.116l2.834 0.865c2.136-1.741 2.741-3.999 2.888-5.502z"></path>
</svg>`,
        },
      ]),
      ...(designerSignedOff ? [
        {
          itemType: "dropdown",
          options: [
            { option: "review", label: "🟠 In-Review" },
            { option: "ready-for-dev", label: "🟢 Ready for Dev" },
            { option: "live", label: "🔵 Live" },
            { option: "live-app", label: "🔵 Live - App" },
            { option: "live-web", label: "🔵 Live - Web" },
            { option: "archived", label: "🔴 Archived" },
          ],
          selectedOption: status,
          tooltip: "Status",
          propertyName: "status",
        },
      ] : []),
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "signOff") {
        setDesignerSignedOff(true)
        setFinalizationDate(getCurrentDateTime())
      }
      if (propertyName === "status" && propertyValue) {
        const newStatus = propertyValue as Status
        setStatus(newStatus)
        // Show checklist when status changes to "In-Review"
        if (newStatus === "review") {
          setShowChecklist(true)
        }
      }
    }
  )

  return (
    <AutoLayout
      name="Widget Root"
      direction="vertical"
      verticalAlignItems="start"
      padding={24}
      fill="#FFFFFF"
      cornerRadius={0}
      spacing={24}
      width={400}
    >
      <TitleSection status={status} photoUrl={currentUserPhotoUrl} userName={currentUserName} designerSignedOff={designerSignedOff} />
      <AutoLayout
        name="timestamp-section"
        direction="vertical"
        verticalAlignItems="start"
        horizontalAlignItems="start"
        spacing={0}
        padding={0}
        width="fill-parent"
        stroke={{
          type: "solid",
          color: colors["border-1"]
        }}
        strokeWidth={1}
        cornerRadius={12}
      >
        <DateRow
          label="Designer"
          date={finalizationDate}
          onRefresh={() => setFinalizationDate(getCurrentDateTime())}
          hasBorderBottom={true}
          photoUrl={currentUserPhotoUrl}
          userName={currentUserName}
          showRefreshButton={false}
          isSignedOff={designerSignedOff}
          onSignOff={() => {
            setDesignerSignedOff(true)
            setFinalizationDate(getCurrentDateTime())
          }}
        />
        {false && (
          <DateRow
            label="Last Revision"
            date={lastRevision}
            onRefresh={() => setLastRevision(getCurrentDateTime())}
            hasBorderBottom={false}
          />
        )}
      </AutoLayout>
      {designerSignedOff && (
        <AutoLayout
          name="approvals-section"
          direction="vertical"
          verticalAlignItems="start"
          horizontalAlignItems="start"
          spacing={0}
          padding={0}
          width="fill-parent"
          stroke={{
            type: "solid",
            color: colors["border-1"]
          }}
          strokeWidth={1}
          cornerRadius={12}
        >
        <ApprovalRow
          role="PM"
          approved={pmApproved}
          assignee={pmAssignee}
          photoUrl={pmPhotoUrl}
          onToggle={() => {
            if (pmApproved) {
              // Toggling from Approved to In-Review - reset assignee and avatar
              setPmApproved(false)
              setPmAssignee(null)
              setPmPhotoUrl(null)
              setPmTimestamp(null)
            } else {
              setPmApproved(true)
              setPmTimestamp(formatDateTime(new Date(), { includeYear: false, separator: ', ', padDay: false }))
            }
          }}
          timestamp={pmTimestamp}
          hasBorderBottom={true}
        />
        <ApprovalRow
          role="Design Lead"
          approved={designLeadApproved}
          assignee={designLeadAssignee}
          photoUrl={designLeadPhotoUrl}
          onToggle={() => {
            if (designLeadApproved) {
              // Toggling from Approved to In-Review - reset assignee and avatar
              setDesignLeadApproved(false)
              setDesignLeadAssignee(null)
              setDesignLeadPhotoUrl(null)
              setDesignLeadTimestamp(null)
            } else {
              setDesignLeadApproved(true)
              setDesignLeadTimestamp(formatDateTime(new Date(), { includeYear: false, separator: ', ', padDay: false }))
            }
          }}
          timestamp={designLeadTimestamp}
          hasBorderBottom={true}
        />
        <ApprovalRow
          role="DSM"
          approved={dsmApproved}
          assignee={dsmAssignee}
          photoUrl={dsmPhotoUrl}
          onToggle={() => {
            if (dsmApproved) {
              // Toggling from Approved to In-Review - reset assignee and avatar
              setDsmApproved(false)
              setDsmAssignee(null)
              setDsmPhotoUrl(null)
              setDsmTimestamp(null)
            } else {
              setDsmApproved(true)
              setDsmTimestamp(formatDateTime(new Date(), { includeYear: false, separator: ', ', padDay: false }))
            }
          }}
          timestamp={dsmTimestamp}
          hasBorderBottom={false}
        />
      </AutoLayout>
      )}
      {(() => {
        const shouldShowChecklist = showChecklist && 
          status !== "ready-for-dev" && 
          status !== "live" && 
          status !== "live-app" && 
          status !== "live-web" && 
          status !== "archived" && 
          checklistData !== null && 
          checklistData !== undefined
        
        if (!shouldShowChecklist) {
          return null
        }
        
        // Compute direction directly from headline (no state delay)
        const isRTLDirection = checklistData && checklistData.headline ? isRTL(checklistData.headline) : true // Default to RTL if no headline
        const textAlign = isRTLDirection ? 'right' : 'left'
        const horizontalAlign = isRTLDirection ? 'end' : 'start'
        const fontFamily = isRTLDirection ? 'Vazirmatn' : 'Inter'
        
        return (
          <AutoLayout
            name="checklist-section"
            direction="vertical"
            verticalAlignItems="start"
            horizontalAlignItems={horizontalAlign}
            spacing={16}
            padding={0}
            width="fill-parent"
          >
            <Text
              fontSize={20}
              fill={colors["content-1"]}
              fontWeight="bold"
              fontFamily={fontFamily}
              horizontalAlignText={textAlign}
              width="fill-parent"
            >
              {checklistData.headline}
            </Text>
            {checklistData.sections.map((section, sectionIndex) => (
            <AutoLayout
              key={sectionIndex}
              name="checklist-group"
              direction="vertical"
              verticalAlignItems="start"
              horizontalAlignItems={horizontalAlign}
              spacing={0}
              padding={0}
              width="fill-parent"
            >
              <Text
                name="section-title"
                fontSize={14}
                fill={colors["content-1"]}
                fontWeight="bold"
                fontFamily={fontFamily}
                horizontalAlignText={textAlign}
                width="fill-parent"
              >
                {section.title}
              </Text>
              {section.items.map((label, itemIndex) => {
                const key = `${sectionIndex}-${itemIndex}`
                return (
                  <CheckboxItem
                    key={key}
                    label={label}
                    checked={checklistItems[key] || false}
                    direction={isRTLDirection ? 'rtl' : 'ltr'}
                    onToggle={() => {
                      setChecklistItems({
                        ...checklistItems,
                        [key]: !checklistItems[key]
                      })
                    }}
                  />
                )
              })}
            </AutoLayout>
            ))}
          </AutoLayout>
        )
      })()}
      <AutoLayout
        name="copyright-wrapper"
        direction="horizontal"
        verticalAlignItems="center"
        spacing={4}
        padding={0}
        width="fill-parent"
        onClick={() => {
          figma.openExternal('https://github.com/sirpooya/figma-signoff-widget')
        }}
        hoverStyle={{ opacity: 0.8 }}
      >
        <SVG
          src={getFeatherMiniIconSrc(colors["content-2"])}
          width={12}
          height={12}
        />
        <Text
          name="copyright-notice"
          fontSize={10}
          fill={colors["content-2"]}
          fontWeight="light"
          letterSpacing={0.5}
          width="fill-parent"
        >
          DesignSignOff Widget
        </Text>
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(CheckboxWidget)
