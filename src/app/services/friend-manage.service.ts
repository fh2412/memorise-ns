import { Injectable, inject } from '@angular/core';
import { FriendsService } from './friends.service';
@Injectable({
    providedIn: 'root'
})
export class ManageFriendsService {
    private friendshipService = inject(FriendsService);


    acceptFriendRequest(userId1: string, userId2: string) {
        this.friendshipService.acceptFriendRequest(userId1, userId2).subscribe(
            response => {
                console.log('Friend request accepted successfully', response);
            },
            error => {
                console.error('Error accepting friend request', error);
            }
        );
    }

    removeFriend(userId1: string, userId2: string) {
        this.friendshipService.removeFriend(userId1, userId2).subscribe(
            response => {
                console.log('Friend removed successfully', response);
            },
            error => {
                console.error('Error removing friend', error);
            }
        );
    }

    sendFriendRequest(receiverId: string, senderId: string) {
        this.friendshipService.sendFriendRequest(senderId, receiverId).subscribe(
            response => {
                console.log('Friend request sent successfully', response);
            },
            error => {
                console.error('Error sending friend request', error);
            }
        );
    }

    addFriendRequest(receiverId: string, senderId: string) {
        this.friendshipService.addFriendRequest(senderId, receiverId).subscribe(
            response => {
                console.log('Friend request sent successfully', response);
            },
            error => {
                console.error('Error sending friend request', error);
            }
        );
    }
}
