
package pers.bertram.planeverything.dao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pers.bertram.planeverything.dao.entity.Plan;

@Repository
public interface PlanRepository extends JpaRepository<Plan, String>{
    
}
