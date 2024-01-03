import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockMemoryService {
  private mockMemories = [
    {
      id: 1,
      title: 'First Memory',
      image_url: 'https://via.placeholder.com/150',
      location: 'Sample Location 1',
      date: '2023-01-01',
      friends: 'Friend 1, Friend 2',
      description: 'This is the first memory'
    },
    {
      id: 2,
      title: 'Second Memory',
      image_url: 'https://via.placeholder.com/150',
      location: 'Sample Location 2',
      date: '2023-02-02',
      friends: 'Friend 3, Friend 4',
      description: 'This is the second memory'
    },
    {
      id: 3,
      title: 'Third Memory',
      image_url: 'https://via.placeholder.com/150',
      location: 'Sample Location 3',
      date: '2023-02-02',
      friends: 'Friend 3, Friend 4',
      description: 'This is the 3 memory'
    },
    // Add more mock memory objects as needed
  ];

  constructor() {}

  getMemories(): Observable<any[]> {
    // Simulate fetching memories for a specific user (userId)
    // In a real service, this would make an API call
    // For now, just return the mock memories array
    return of(this.mockMemories);
  }
}
