import { useEffect, useState } from "react"
import { Container } from "../../components/container"
import { FaTelegram } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";

import { Swiper, SwiperSlide } from "swiper/react";


interface GroupProps{
    id: string;
    name: string;
    model: string;
    description: string;
    created: string;
    telegram: string;
    uid: string;
    owner: string;
    images: ImageCarProps[];
}

interface ImageCarProps{
    uid: string;
    name: string;
    url: string;
}

export function GroupDetail() {

    const { id } = useParams();
    const [group, setGroup] = useState<GroupProps>();
    const [sliderPerView, setSliderPerView] = useState<number>(2);
    const navigate = useNavigate();

    useEffect(() => {

        async function loadGroup() {
            if(!id) { return }

            const docRef = doc(db, "grupos", id)
            getDoc(docRef)
            .then((snapshot) => {

                if(!snapshot.data()){
                    navigate("/")
                }

                setGroup({
                    id: snapshot.id,
                    name: snapshot.data()?.name,
                    model: snapshot.data()?.model,
                    uid: snapshot.data()?.uid,
                    description: snapshot.data()?.description,
                    created: snapshot.data()?.created,
                    telegram: snapshot.data()?.telegram,
                    owner: snapshot.data()?.owner,
                    images: snapshot.data()?.images
                })
            })
        }

        loadGroup();
        
    }, [id])

    useEffect(() => {
        function handleResize() {
            if(window.innerWidth < 720) {
                setSliderPerView(1);
            } else {
                setSliderPerView(2);
            }
        }

        handleResize();

        window.addEventListener("resize", handleResize)

        return() => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])
    
    return (
        <Container>
            {group && (
            <Swiper
                slidesPerView={sliderPerView}
                pagination={{ clickable: true }}
                navigation
                >
                    {group?.images.map ( image => (
                        <SwiperSlide key={image.name}>
                            <img src={image.url} className="w-full h-96 object-cover" />
                        </SwiperSlide>
                    ))}
    
            </Swiper>
            )}

            { group && (
                <main
                className="w-full bg-white rounded-lg p-6 my-4"
                >
                    <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
                        <h1 className="font-bold text-3xl text-black">{group?.name}</h1>
                    </div>

                    <p><strong>Telegram: </strong>{group?.model}</p>

                    <strong>Descrição:</strong>
                    <p className="mb-4">{group?.description}</p>

                    <a
                    className=" bg-blue-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium cursor-pointer"
                    href={group?.telegram}
                    target="_blank"
                    >
                    Entrar no Grupo
                    <FaTelegram size={26} color="#FFF" />
                    </a>

                </main>
            ) }
        </Container>
    )
}