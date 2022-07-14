import Skeleton from 'react-loading-skeleton'
import './SkeletonCard.css'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonCard = (props) => {
    
  return Array(props.count).fill(0).map((_,i) => (
        <div className={`${props.albumWrapper}  ${props.songWrapper}`} key={i}>
            
            <div className={`${props.imgSkeleton} ${props.trackLine}`}>
                <Skeleton width={props.albumWidth} height={props.albumHeight}/>
            </div>

            <div className={`${props.bottomSkeleton} ${props.trackLine}`}>
                <Skeleton count={`${props.btnCount}`} width={props.songWidth} 
                height={props.songHeightAlbum}/>
            </div>
    </div>
    ))
    
  
}

export default SkeletonCard