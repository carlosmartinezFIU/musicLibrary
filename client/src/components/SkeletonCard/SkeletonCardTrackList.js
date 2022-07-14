import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const SkeletonCardTrackList = (props) => {
    return Array(props.count).fill(0).map((_,i) => (
        <div className={props.skeletonSongTrackList} key={i}>
            
            <div className={props.songTrackContainer}>
                <Skeleton count={1}  height={"100%"}/>
            </div>
    </div>
    ))
}

export default SkeletonCardTrackList