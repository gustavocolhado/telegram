import { useState, useEffect } from "react";
import { Container } from "../../components/container";
import {
    collection,
    query,
    getDocs,
    orderBy,
    where
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Link } from "react-router-dom";

interface GroupProps{
    id: string;
    name: string;
    model: string;
    telegram: string;
    uid: string;
    description: string;
    images: CarImageProps[];
}

interface CarImageProps{
    name: string;
    uid: string;
    url: string;
}

export function Home() {

    const [groups, setGroups] = useState<GroupProps[]>([]);
    const [loadImages, setLoadImages] = useState<string[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        loadGroups();

    }, [])

    function loadGroups() {
        const groupRef = collection(db, "grupos")
        const queryRef = query(groupRef, orderBy("created", "desc"))

        getDocs(queryRef)
        .then((snapshot) => {
            let listgroups = [] as GroupProps[];

            snapshot.forEach( doc => {
                listgroups.push({
                    id: doc.id,
                    name: doc.data().name,
                    model: doc.data().model,
                    telegram: doc.data().telegram,
                    description: doc.data().description,
                    images: doc.data().images,
                    uid: doc.data().uid
                })
            })

            setGroups(listgroups);

        })
    }

    function handleImageLoad(id: string) {
        setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
    }

    async function handleSearchCar() {
        if(input === '') {
            loadGroups();
            return;
        }

        setGroups([]);
        setLoadImages([]);

        const q = query(collection(db, "grupos"),
        where("name", ">=", input.toUpperCase()),
        where("name", "<=", input.toUpperCase() + "\uf8ff")
        )

        const querySnapshot = await getDocs(q)

        let listgroups = [] as GroupProps[];

        querySnapshot.forEach((doc) => {

            listgroups.push({
                id: doc.id,
                name: doc.data().name,
                telegram: doc.data().telegram,
                description: doc.data().description,
                model: doc.data().model,
                images: doc.data().images,
                uid: doc.data().uid
            })

        })

        setGroups(listgroups);

    }

    return (
        <Container>
            <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
                <input
                className="w-full border-2 rounded-lg h-9 px-3 outline-none"
                placeholder="Digite o nome do grupo que deseja encontrar..."
                value={input}
                onChange={ (e) => setInput(e.target.value)}
                />
                <button className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium"
                onClick={handleSearchCar}>
                    Buscar
                    </button>
            </section>
            <h1 className="font-bold text-center mt-6 text-2xl mb-4">
                OS MELHORES GRUPOS DE PUTARIA DO TELEGRAM
            </h1>
            <main className="grid grid-cols-1 gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                
                {groups.map( group => (
                    <Link key={group.id} to={`/group/${group.id}`}>
                        <section className="w-full bg-white rounded-lg ">
                        <div
                        className="w-full h-72 rounded-lg bg-slate-200"
                        style={{ display: loadImages.includes(group.id) ? "none": "block"}}
                        ></div>
                        <img
                        className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                        src={group.images[0].url}
                        onLoad={ () => handleImageLoad(group.id) }
                        style={{ display: loadImages.includes(group.id) ? "block" : "none" }}
                        />
                        <p className="font-bold mt-1 mb-2 px-2 text-center">{group.name}</p>
                        <div className="flex flex-col px-2">
                            <strong className="font-medium text-sm text-center">{group.model}</strong>
                        </div>
                        <div className="w-full my-2 p-3">
                        <button className="w-full h-10 rounded-md p-2 text-white font-medium bg-slate-900">Ver Detalhes</button>
                        </div>
                        <div className="px-2 pb-2">
                            <span className="text-zinc-700"></span>
                        </div>
                        </section>
                    </Link>
                ))}

            </main>
        </Container>
    )
}