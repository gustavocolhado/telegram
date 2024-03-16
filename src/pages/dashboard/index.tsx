import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelHeader";
import { useEffect, useState, useContext } from "react";
import { FiTrash2 } from "react-icons/fi";

import { collection, getDocs, where, query, doc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { ref, deleteObject } from "firebase/storage";
import { AuthContext } from "../../contexts/AuthContext";

interface GroupProps{
    id: string;
    name: string;
    year: string;
    price: string;
    city: string;
    km: string;
    images: ImageCarProps[];
    uid: string;
}

interface ImageCarProps{
    name: string;
    uid: string;
    url: string;
}

export function Dashboard() {

    const [groups, setGroups] = useState<GroupProps[]>([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        function loadGroups() {

            if(!user?.uid) {
                return;
            }

            const carsRef = collection(db, "grupos")
            const queryRef = query(carsRef, where("uid", "==", user.uid))

            getDocs(queryRef)
            .then((snapshot) => {
                let listgroups = [] as GroupProps[];

                snapshot.forEach( doc => {
                    listgroups.push({
                        id: doc.id,
                        name: doc.data().name,
                        year: doc.data().year,
                        km: doc.data().km,
                        city: doc.data().city,
                        price: doc.data().price,
                        images: doc.data().images,
                        uid: doc.data().uid
                    })
                })

                setGroups(listgroups);

            })
        }

        loadGroups();

    }, [user])

    async function handleDeleteCar(group: GroupProps) {

        const itemGroup = group;

        const docRef = doc(db, "grupos", itemGroup.id);
        await deleteDoc(docRef);

        itemGroup.images.map( async (image) => {
            const imagePath = `images/${image.uid}/${image.name}`
            const imageRef = ref(storage, imagePath)

            try {
                await deleteObject(imageRef)
                setGroups(groups.filter(group => group.id !== itemGroup.id));
            } catch(err) {

            }
            
        })

        
    }

    return (
        <Container>
            <DashboardHeader />

            <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                {groups.map( group => (
                    <section key={group.id} className="w-full bg-white rounded-lg relative">
                    <button
                    className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow"
                    onClick={ () =>  handleDeleteCar(group) }
                    >
                        <FiTrash2 size={26} color="#000" />
                    </button>
                    <img
                    src={group.images[0].url}
                    className="w-full rounded-lg mb-2 max-h-70"
                    
                    />
                    <p className="font-bold mt-1 px-2 mb-2 text-center">{group.name}</p>
                </section>
                ))}

            </main>
        </Container>
    )
}