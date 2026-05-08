import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Props {
  communityId:  number
  name:         string
  description:  string
  memberCount:  number
  proposalCount: number
  votingReq:    any
  isAdmin?:     boolean
}

function reqLabel(req: any): { label: string; cls: string } {
  if (!req) return { label: 'Open', cls: 'req-badge-open' }
  if ('tokenGated' in req) return { label: 'Token gated', cls: 'req-badge-token' }
  if ('nftGated'   in req) return { label: 'NFT gated',   cls: 'req-badge-nft'   }
  return { label: 'Open', cls: 'req-badge-open' }
}

export default function CommunityCard({
  communityId, name, description, memberCount, proposalCount, votingReq, isAdmin,
}: Props) {
  const { label, cls } = reqLabel(votingReq)

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
    >
      <Link to={`/community/${communityId}`} className="proposal-card community-card">
        <div className="proposal-card-accent community-accent" />
        <div className="community-card-inner">
          <div className="community-card-head">
            <span className={`req-badge ${cls}`}>{label}</span>
            {isAdmin && <span className="badge badge-created">admin</span>}
          </div>
          <h3 className="community-card-name">{name}</h3>
          {description && (
            <p className="community-card-desc">{description}</p>
          )}
          <div className="community-card-stats">
            <span className="community-stat">
              <span className="community-stat-n">{memberCount}</span>
              <span className="community-stat-l">members</span>
            </span>
            <span className="community-stat-sep" />
            <span className="community-stat">
              <span className="community-stat-n">{proposalCount}</span>
              <span className="community-stat-l">proposals</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
