import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'

// Fixed UUID for the Dictate Text action — used to reference its output in the POST body
const DICTATE_UUID = 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890'

function buildShortcutPlist(userId: string, appUrl: string): string {
  const authValue = `Bearer ${userId}`
  const logUrl = `${appUrl}/api/log`

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>WFWorkflowMinimumClientVersion</key>
  <integer>900</integer>
  <key>WFWorkflowMinimumClientVersionString</key>
  <string>900</string>
  <key>WFWorkflowHasShortcutInputVariables</key>
  <false/>
  <key>WFWorkflowIcon</key>
  <dict>
    <key>WFWorkflowIconStartColor</key>
    <integer>431817727</integer>
    <key>WFWorkflowIconGlyphNumber</key>
    <integer>59511</integer>
  </dict>
  <key>WFWorkflowImportQuestions</key>
  <array/>
  <key>WFWorkflowInputContentItemClasses</key>
  <array>
    <string>WFAppContentItem</string>
    <string>WFStringContentItem</string>
    <string>WFURLContentItem</string>
  </array>
  <key>WFWorkflowActions</key>
  <array>

    <!-- Action 1: Dictate Text -->
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.dictatetext</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>UUID</key>
        <string>${DICTATE_UUID}</string>
        <key>WFSpeechLanguage</key>
        <string>default</string>
      </dict>
    </dict>

    <!-- Action 2: POST to MrTracker API -->
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.downloadurl</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>WFURL</key>
        <string>${logUrl}</string>
        <key>WFHTTPMethod</key>
        <string>POST</string>
        <key>WFHTTPHeaders</key>
        <dict>
          <key>Value</key>
          <dict>
            <key>WFDictionaryFieldValueItems</key>
            <array>
              <dict>
                <key>WFItemType</key>
                <integer>0</integer>
                <key>WFKey</key>
                <dict>
                  <key>Value</key>
                  <dict>
                    <key>string</key>
                    <string>Authorization</string>
                  </dict>
                  <key>WFSerializationType</key>
                  <string>WFTextTokenString</string>
                </dict>
                <key>WFValue</key>
                <dict>
                  <key>Value</key>
                  <dict>
                    <key>string</key>
                    <string>${authValue}</string>
                  </dict>
                  <key>WFSerializationType</key>
                  <string>WFTextTokenString</string>
                </dict>
              </dict>
              <dict>
                <key>WFItemType</key>
                <integer>0</integer>
                <key>WFKey</key>
                <dict>
                  <key>Value</key>
                  <dict>
                    <key>string</key>
                    <string>Content-Type</string>
                  </dict>
                  <key>WFSerializationType</key>
                  <string>WFTextTokenString</string>
                </dict>
                <key>WFValue</key>
                <dict>
                  <key>Value</key>
                  <dict>
                    <key>string</key>
                    <string>application/json</string>
                  </dict>
                  <key>WFSerializationType</key>
                  <string>WFTextTokenString</string>
                </dict>
              </dict>
            </array>
          </dict>
          <key>WFSerializationType</key>
          <string>WFDictionaryFieldValue</string>
        </dict>
        <key>WFHTTPBodyType</key>
        <string>JSON</string>
        <key>WFFormValues</key>
        <dict>
          <key>Value</key>
          <dict>
            <key>WFDictionaryFieldValueItems</key>
            <array>
              <!-- text = Dictated Text variable -->
              <dict>
                <key>WFItemType</key>
                <integer>0</integer>
                <key>WFKey</key>
                <dict>
                  <key>Value</key>
                  <dict>
                    <key>string</key>
                    <string>text</string>
                  </dict>
                  <key>WFSerializationType</key>
                  <string>WFTextTokenString</string>
                </dict>
                <key>WFValue</key>
                <dict>
                  <key>Value</key>
                  <dict>
                    <key>attachmentsByRange</key>
                    <dict>
                      <key>{0, 1}</key>
                      <dict>
                        <key>OutputName</key>
                        <string>Dictated Text</string>
                        <key>OutputUUID</key>
                        <string>${DICTATE_UUID}</string>
                        <key>Type</key>
                        <string>ActionOutput</string>
                      </dict>
                    </dict>
                    <key>string</key>
                    <string>&#xFFFC;</string>
                  </dict>
                  <key>WFSerializationType</key>
                  <string>WFTextTokenString</string>
                </dict>
              </dict>
              <!-- source = "shortcut" -->
              <dict>
                <key>WFItemType</key>
                <integer>0</integer>
                <key>WFKey</key>
                <dict>
                  <key>Value</key>
                  <dict>
                    <key>string</key>
                    <string>source</string>
                  </dict>
                  <key>WFSerializationType</key>
                  <string>WFTextTokenString</string>
                </dict>
                <key>WFValue</key>
                <dict>
                  <key>Value</key>
                  <dict>
                    <key>string</key>
                    <string>shortcut</string>
                  </dict>
                  <key>WFSerializationType</key>
                  <string>WFTextTokenString</string>
                </dict>
              </dict>
            </array>
          </dict>
          <key>WFSerializationType</key>
          <string>WFDictionaryFieldValue</string>
        </dict>
      </dict>
    </dict>

    <!-- Action 3: Show Notification -->
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.shownotification</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>WFNotificationActionTitle</key>
        <string>MrTracker</string>
        <key>WFNotificationActionBody</key>
        <string>Logged &#x2713;</string>
      </dict>
    </dict>

  </array>
</dict>
</plist>`
}

export async function GET(req: NextRequest) {
  let userId: string | null = null

  // Bearer token path
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim()
    const db = createSupabaseAdmin()
    const { data } = await db.from('profiles').select('id').eq('id', token).single()
    if (data) userId = data.id
  } else {
    // Session cookie path
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) userId = user.id
  }

  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mrtracker-ios.vercel.app'
  const plist = buildShortcutPlist(userId, appUrl)

  return new NextResponse(plist, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="MrTracker.shortcut"',
    },
  })
}
