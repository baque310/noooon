import React from 'react'
import { Howl, Howler } from 'howler';
export const usePlaySound = () => {
    let Sound: Howl | undefined;
    const PlaySound = () => {
        if (Sound === undefined) {
            Sound = new Howl({
                src: ['./notification.mp3'],
                html5: true, 

            });
        }
        if (Sound) {
            Sound.play();
            // Change global volume.
            Howler.volume(100);
        }
    };
    return PlaySound;
  
}
