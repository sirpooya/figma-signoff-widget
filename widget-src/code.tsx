const { widget } = figma
const { AutoLayout, Text, SVG, Image, Rectangle, useSyncedState, usePropertyMenu, useEffect } = widget

import * as checklistData from './checklist.json'

// Color variables
const colors = {
  "content-1": "#1F1F1F",
  "content-2": "#5C5C5C",
  "link": "#1672DD",
  "border-1": "#ECEDEF",
  "error": "#EB3850",
  "info": "#3F69F2",
  "success": "#3DAA58",
  "warning": "#F57F17",
  "warning-tonal": "#FEF0E3",
  "on-warning-tonal": "#934C0E",
  "on-error": "#FFFFFF",
  "on-info": "#FFFFFF",
  "on-success": "#FFFFFF",
  "on-warning": "#FFFFFF"
}

type Status = "review" | "ready-for-dev" | "live" | "archived"

const statusConfig: { [key in Status]: { label: string; color: string; textColor: string } } = {
  "review": { label: "In-Review", color: colors.warning, textColor: colors["on-warning"] },
  "ready-for-dev": { label: "Ready for Dev", color: colors.success, textColor: colors["on-success"] },
  "live": { label: "Live", color: colors.info, textColor: colors["on-info"] },
  "archived": { label: "Archived", color: colors.error, textColor: colors["on-error"] }
}

const getRefreshIconSrc = (color: string) => `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path fill="${color}" d="M18.58 10.311c0.293-0.292 0.768-0.292 1.061 0.001l2.589 2.602c0.292 0.294 0.291 0.768-0.003 1.061s-0.768 0.291-1.061-0.002l-1.33-1.337c-0.323 4.039-3.701 7.217-7.823 7.217-2.516-0-4.755-1.185-6.19-3.024-0.255-0.326-0.197-0.798 0.129-1.053s0.798-0.197 1.053 0.13c1.163 1.49 2.975 2.446 5.009 2.446 3.278 0 5.976-2.484 6.315-5.673l-1.304 1.298c-0.294 0.292-0.769 0.291-1.062-0.003s-0.29-0.768 0.003-1.061l2.615-2.603zM12.013 4.151c2.696 0 5.074 1.36 6.486 3.427 0.233 0.342 0.146 0.808-0.196 1.042s-0.808 0.146-1.042-0.196c-1.145-1.675-3.069-2.772-5.248-2.772-3.364 0-6.115 2.616-6.334 5.925l1.301-1.31c0.292-0.294 0.767-0.295 1.061-0.003s0.296 0.766 0.004 1.059l-2.6 2.622c-0.292 0.294-0.768 0.295-1.062 0.004l-2.606-2.586c-0.294-0.292-0.296-0.768-0.004-1.062s0.767-0.296 1.061-0.004l1.34 1.329c0.195-4.161 3.63-7.475 7.84-7.476z"></path>
</svg>
`

function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  const month = monthNames[date.getMonth()]
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year} ${month} ${day} - ${hours}:${minutes}`
}

function getCurrentDateTime(): string {
  return formatDateTime(new Date())
}

function DateRow({ label, date, onRefresh, hasBorderBottom }) {
  return (
    <AutoLayout
      name="timestamp-row"
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
        spacing={4}
        width="fill-parent"
      >
        <Text
          name="date-label"
          fontSize={14}
          fill={colors["content-1"]}
          fontWeight="medium"
          width="fill-parent"
        >
          {label}
        </Text>
        <Text
          name="date-value"
          fontSize={14}
          fill={colors["content-2"]}
          fontWeight="normal"
          width="fill-parent"
        >
          {date}
        </Text>
      </AutoLayout>
      <SVG
        name="refresh-button"
        src={getRefreshIconSrc(colors.link)}
        onClick={onRefresh}
      />
    </AutoLayout>
  )
}

function ApprovalRow({ role, approved, assignee, photoUrl, onToggle, hasBorderBottom }) {
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
        spacing={4}
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
          spacing={8}
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
            <Rectangle
              name="avatar"
              cornerRadius={12}
              width={16}
              height={16}
              fill={colors["border-1"]}
            />
          )}
          <Text
            name="assignee"
            fontSize={14}
            fill={colors["content-2"]}
            fontWeight="normal"
            width="fill-parent"
          >
            {assignee || "{Assignee}"}
          </Text>
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

function CheckboxItem({ label, checked, onToggle }) {
  return (
    <AutoLayout
      direction="horizontal"
      verticalAlignItems="center"
      spacing={12}
      padding={{ top: 8, bottom: 8, left: 0, right: 0 }}
      width="fill-parent"
      onClick={onToggle}
    >
      <Text
        fontSize={14}
        fill="#000000"
        fontFamily="Vazirmatn"
        horizontalAlignText="right"
        width="fill-parent"
      >
        {label}
      </Text>
      <AutoLayout
        width={20}
        height={20}
        verticalAlignItems="center"
        horizontalAlignItems="center"
        fill={checked ? "#6366F1" : "#FFFFFF"}
        cornerRadius={4}
        stroke={{
          type: 'solid',
          color: checked ? "#6366F1" : "#000000"
        }}
        strokeWidth={2}
      >
        {checked && (
          <Text
            fontSize={14}
            fill="#FFFFFF"
          >
            ✓
          </Text>
        )}
      </AutoLayout>
    </AutoLayout>
  )
}

function TitleSection({ status, photoUrl, userName }: { status: Status; photoUrl: string | null; userName: string }) {
  const config = statusConfig[status]
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
          Design Sign-Off
        </Text>
        <AutoLayout
          name="subtitle-wrapper"
          direction="horizontal"
          verticalAlignItems="center"
          spacing={8}
          padding={{ top: 0, bottom: 0, left: 0, right: 0 }}
          width="fill-parent"
        >
          {photoUrl ? (
            <Image name="avatar" cornerRadius={12} width={16} height={16} src={String(photoUrl)} />
          ) : (
            <Rectangle name="avatar" cornerRadius={12} width={16} height={16} fill={colors["border-1"]} />
          )}
          <Text
            name="subtitle"
            fontSize={14}
            fontWeight="normal"
            fill={colors["content-2"]}
            width="fill-parent"
          >
            {userName}
          </Text>
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

function CheckboxWidget() {
  const [status, setStatus] = useSyncedState<Status>('status', 'review')
  const [finalizationDate, setFinalizationDate] = useSyncedState('finalizationDate', getCurrentDateTime())
  const [lastRevision, setLastRevision] = useSyncedState('lastRevision', getCurrentDateTime())
  const [pmApproved, setPmApproved] = useSyncedState('pmApproved', false)
  const [pmAssignee, setPmAssignee] = useSyncedState<string | null>('pmAssignee', null)
  const [pmPhotoUrl, setPmPhotoUrl] = useSyncedState<string | null>('pmPhotoUrl', null)
  const [designLeadApproved, setDesignLeadApproved] = useSyncedState('designLeadApproved', false)
  const [designLeadAssignee, setDesignLeadAssignee] = useSyncedState<string | null>('designLeadAssignee', null)
  const [designLeadPhotoUrl, setDesignLeadPhotoUrl] = useSyncedState<string | null>('designLeadPhotoUrl', null)
  const [dsmApproved, setDsmApproved] = useSyncedState('dsmApproved', false)
  const [dsmAssignee, setDsmAssignee] = useSyncedState<string | null>('dsmAssignee', null)
  const [dsmPhotoUrl, setDsmPhotoUrl] = useSyncedState<string | null>('dsmPhotoUrl', null)
  const [showChecklist, setShowChecklist] = useSyncedState('showChecklist', true)
  // Current user info for avatar display
  const [currentUserName, setCurrentUserName] = useSyncedState<string>('currentUserName', "")
  const [currentUserPhotoUrl, setCurrentUserPhotoUrl] = useSyncedState<string | null>('currentUserPhotoUrl', null)
  // Initialize checklist items state from JSON
  const [checklistItems, setChecklistItems] = useSyncedState<{ [key: string]: boolean }>(
    'checklistItems',
    checklistData.sections.reduce((acc, section, sectionIndex) => {
      section.items.forEach((_, itemIndex) => {
        const key = `${sectionIndex}-${itemIndex}`
        acc[key] = false
      })
      return acc
    }, {} as { [key: string]: boolean })
  )

  // Capture current user info when widget loads (EXACTLY matching WidgetUserBadge pattern)
  useEffect(() => {
    if (!currentUserName) {
      if (figma.currentUser) {
        setCurrentUserName(figma.currentUser.name)
        setCurrentUserPhotoUrl(figma.currentUser.photoUrl)
      } else {
        figma.notify("Please login to Figma")
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
      {
        itemType: "dropdown",
        options: [
          { option: "review", label: "In-Review" },
          { option: "ready-for-dev", label: "Ready for Dev" },
          { option: "live", label: "Live" },
          { option: "archived", label: "Archived" },
        ],
        selectedOption: status,
        tooltip: "Status",
        propertyName: "status",
      },
      {
        itemType: "action",
        tooltip: "Toggle Checklist",
        propertyName: "toggleChecklist",
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "status" && propertyValue) {
        setStatus(propertyValue as Status)
      } else if (propertyName === "toggleChecklist") {
        setShowChecklist(!showChecklist)
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
      <TitleSection status={status} photoUrl={currentUserPhotoUrl} userName={currentUserName} />
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
        cornerRadius={8}
      >
        <DateRow
          label="Finalization Date"
          date={finalizationDate}
          onRefresh={() => setFinalizationDate(getCurrentDateTime())}
          hasBorderBottom={true}
        />
        <DateRow
          label="Last Revision"
          date={lastRevision}
          onRefresh={() => setLastRevision(getCurrentDateTime())}
          hasBorderBottom={false}
        />
      </AutoLayout>
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
        cornerRadius={8}
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
            } else {
              setPmApproved(true)
            }
          }}
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
            } else {
              setDesignLeadApproved(true)
            }
          }}
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
            } else {
              setDsmApproved(true)
            }
          }}
          hasBorderBottom={false}
        />
      </AutoLayout>
      {showChecklist && (
        <AutoLayout
          name="checklist-section"
          direction="vertical"
          verticalAlignItems="start"
          horizontalAlignItems="end"
          spacing={12}
          padding={0}
          width="fill-parent"
        >
          {checklistData.sections.map((section, sectionIndex) => (
            <AutoLayout
              key={sectionIndex}
              name="checklist-group"
              direction="vertical"
              verticalAlignItems="start"
              horizontalAlignItems="end"
              spacing={8}
              padding={0}
              width="fill-parent"
            >
              <Text
                name="section-title"
                fontSize={14}
                fill={colors["content-1"]}
                fontWeight="medium"
                fontFamily="Vazirmatn"
                horizontalAlignText="right"
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
      )}
    </AutoLayout>
  )
}

widget.register(CheckboxWidget)
