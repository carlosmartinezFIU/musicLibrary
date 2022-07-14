import { createContext, useState } from "react";

export const DataContext = createContext();

export function DataProvider({children}){
    const [dataArtist, setDataArtist] = useState();
    const [dataToken, setDataToken] = useState();
    const [dataArtistId, setDataArtistId] = useState();
    const [dataAlbums, setDataAlbums] = useState([]);
    const [profileTrack, setProfileTrack] = useState([]);
    const [profileAlbum, setProfileAlbum] = useState([]);
    const [isActiveSkeleton, setIsActiveSkeleton] = useState(false)
    const [awsImage, setAwsImage] = useState([])
    const [showImage, setShowImage] = useState(false)
    const [showModal, setShowModal] = useState(false)

    return(
        <DataContext.Provider
        value={{dataArtist, setDataArtist,
                dataArtistId, setDataArtistId,
                profileTrack, setProfileTrack,
                showModal, setShowModal,
                profileAlbum, setProfileAlbum,
                showImage, setShowImage,
                isActiveSkeleton, setIsActiveSkeleton,
                awsImage, setAwsImage,
                dataAlbums, setDataAlbums,
                dataToken, setDataToken}}
        >
            {children}
        </DataContext.Provider>
    )

}

export default DataContext;