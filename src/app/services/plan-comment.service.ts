import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlanComment, ReactionKey, ReactionSummary } from '@models/planItem.model';

/** Comments come newest first. */
export interface CommentPage {
    comments: PlanComment[];
    hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlanCommentService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    private url(memoryId: string, itemId: number, path: string): string {
        return `${this.apiUrl}/memories/${memoryId}/plan/items/${itemId}${path}`;
    }

    list(memoryId: string, itemId: number, before?: number, limit = 50): Observable<CommentPage> {
        let params = new HttpParams().set('limit', limit);
        if (before) params = params.set('before', before);
        return this.http.get<CommentPage>(this.url(memoryId, itemId, '/comments'), { params });
    }

    add(memoryId: string, itemId: number, body: string): Observable<PlanComment> {
        return this.http
            .post<{ comment: PlanComment }>(this.url(memoryId, itemId, '/comments'), { body })
            .pipe(map(r => r.comment));
    }

    edit(memoryId: string, itemId: number, commentId: number, body: string): Observable<PlanComment> {
        return this.http
            .patch<{ comment: PlanComment }>(this.url(memoryId, itemId, `/comments/${commentId}`), { body })
            .pipe(map(r => r.comment));
    }

    remove(memoryId: string, itemId: number, commentId: number): Observable<void> {
        return this.http.delete<void>(this.url(memoryId, itemId, `/comments/${commentId}`));
    }

    /** on = true adds the reaction (PUT), on = false removes it (DELETE). */
    react(memoryId: string, itemId: number, key: ReactionKey, on: boolean): Observable<ReactionSummary[]> {
        const url = this.url(memoryId, itemId, `/reactions/${key}`);
        const request = on
            ? this.http.put<{ reactions: ReactionSummary[] }>(url, {})
            : this.http.delete<{ reactions: ReactionSummary[] }>(url);
        return request.pipe(map(r => r.reactions));
    }
}
