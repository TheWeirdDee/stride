import { ImageResponse } from 'next/og'

export const alt = 'Stride — stake on your movement'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#cdfb46"/><g transform="translate(106 106) scale(12.5)" fill="none" stroke="#1c2900" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12.5" cy="4.3" r="2" fill="#1c2900" stroke="none"/><path d="M12 6.6 L8.8 12 L12.5 13.5 L12 19"/><path d="M8.8 12 L5.5 15"/><path d="M10.6 8.6 L14.6 10"/><path d="M13.6 17.4 l2.3 2.3 L20.4 14"/></g></svg>`

export default function OpengraphImage() {
  const iconData = `data:image/svg+xml;base64,${Buffer.from(ICON).toString('base64')}`
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#06080a', padding: 80, color: '#f4f6f3', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconData} width={88} height={88} alt="" />
          <div style={{ fontSize: 48, fontWeight: 800, marginLeft: 22 }}>Stride</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: 78, fontWeight: 800, lineHeight: 1.05, maxWidth: 1000 }}>
          <span style={{ marginRight: 18 }}>Put your money where your</span>
          <span style={{ color: '#cdfb46' }}>miles are</span>
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#9aa1a8' }}>
          Stake USDm · move for real · get it back plus a bonus · on Celo
        </div>
      </div>
    ),
    { ...size }
  )
}
