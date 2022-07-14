import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonArtistSearch = (props) => {
    return Array(props.count).fill(0).map((_,i) => (
        <div className={props.artistSearchWrapper} key={i}>
            
            <div className={props.imageQueryContainer}>
                <Skeleton height={"100%"}/>
            </div>

            <div className={props.bottomQueryContainer}>
                <Skeleton count={2}  height={"100%"}/>
            </div>
    </div>
    ))
}

export default SkeletonArtistSearch