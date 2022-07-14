import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonSearch = (props) => {
    return Array(props.count).fill(0).map((_,i) => (
        <div className={props.skeletonSearchWrapper} key={i}>
            
            <div className={props.imageSearchContainer}>
                <Skeleton height={"100%"} duration={2.8}/>
            </div>

            <div className={props.bottomSearchContainer}>
                <Skeleton count={2}  height={"100%"} duration={2.8}/>
            </div>
    </div>
    ))
}

export default SkeletonSearch